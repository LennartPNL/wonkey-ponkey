// New game object

var game = new Phaser.Game('100%', '100%', Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update,
        render: render,
        resize: resize
    }
);

// Initialize variables

var paddle1;
var paddle2;
var ball;
var ball_launched;
var score1;
var score2;
var score2_text;
var score1_text;
var eventTextPlace;
var welcomeTextPlace;
var eventText;
var welcomeText;
var bounds;
var cursors;
var spaceKey;
var wKey;
var sKey;
var aKey;
var dKey;
var lastHitBy;
var wallHits;
var emitter1;
var emitter2;


function preload() {

    // Load object textures

    game.load.image('racket1', 'assets/racket1.png');
    game.load.image('racket2', 'assets/racket2.png');
    game.load.image('racketWin', 'assets/hitPaddle.png');
    game.load.image('ball', 'assets/ball.png');
    game.load.image('fire', 'assets/fire.png');


    // Load font for score

    game.load.bitmapFont('font', 'assets/font.png', 'assets/font.xml');

    // Load world bounds textures and physics

    game.load.image("ctop", "assets/hctop.png");
    game.load.image("cbottom", "assets/hcbottom.png");
    game.load.image("ictop", "assets/invisibleTop.png");
    game.load.image("icbottom", "assets/invisibleBottom.png");
    game.load.physics("bounds", "assets/phys.json");

}

function create() {

    // Game object settings

    game.stage.backgroundColor = "#4488AA";
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.restitution = 1.0;
    game.physics.p2.setImpactEvents(true);

    // Determining inputs possible on the game object

    cursors = game.input.keyboard.createCursorKeys();
    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);


    // Creating the racket objects

    paddle1 = createRacket(600, game.world.centerY, "r1");
    paddle2 = createRacket(game.world.width - 600, game.world.centerY, "r2");

    emitter1 = addEmission(emitter1, paddle1);
    emitter2 = addEmission(emitter2, paddle2);


    // Creating the ball

    ball = createBall(game.world.centerX, game.world.centerY);

    // Creating the round border object around the other objects

    createGameBounds(game.world.centerX, 435);

    // Display the scores

    score1_text = game.add.bitmapText(128, 128, 'font', '0', 64);
    score2_text = game.add.bitmapText(game.world.width - 128, 128, 'font', '0', 64);

    score1 = 0;
    score2 = 0;

    // Display event text

    eventTextPlace = game.add.bitmapText(200, 700, 'font', '0', 64);
    eventText = "Press the space bar to launch the ball!";

    // Display welcome text

    welcomeTextPlace = game.add.bitmapText(300, 400, 'font', '0', 64);
    welcomeText = "Welcome to Wonkey - Pongkey!";

    // The wall has been hit 0 times and the amount of times the rackets have touched the ball

    wallHits = 0;


}


function update() {

    // If the ball is not launched, it should not move

    if (!ball_launched) {
        ball.body.static = true;
    }

    // Launch Ball when space is pressed

    if (this.spaceKey.isDown && !ball_launched) {
        wallHits = 0;
        eventText = "";
        ball.body.static = false;
        launchBall(ball);
        ball_launched = true;
        welcomeText = "";
    }

    // Update the scores and event text

    score1_text.text = "P1: \n" + score1;
    score2_text.text = "P2: \n" + score2;
    eventTextPlace.text = eventText;
    welcomeTextPlace.text = welcomeText;

    // Listen for control input on both paddle objects

    if (ball_launched) {

        control_paddle1(paddle1);
        control_paddle2(paddle2);

    }

    // Check if the ball object has collided with another object and react accordingly

    ball.body.onBeginContact.add(checkHit, game);

    // Check if the game has been won

    checkScore(score1, score2);


}

function render() {
    // Phaser function
}


function resize() {
    // Phaser function
}

function checkScore(s1, s2) {

    // Checks if a player has won the game

    if (s1 > 4 && s1 - s2 > 2) {
        eventText = "Player 1 won with " + s1 + " points!";
        score1 = 0;
        score2 = 0;
    }

    if (s2 > 4 && s2 - s1 > 2) {
        eventText = "Player 2 won with " + s2 + " points!";
        score2 = 0;
        score1 = 0;
    }

}


function checkHit(body) {

    // Only execute further code when the body of the given object collides with another object

    if (body) {

        // If the ball object collides with the paddle1 object

        if (body.sprite.key.toString() === "racket1") {
            wallHits = 0;
            lastHitBy = 1;
        }

        // If the ball object collides with the paddle2 object

        if (body.sprite.key.toString() === "racket2") {
            wallHits = 0;
            lastHitBy = 2;
        }

        if (wallHits === 0) {
            paddle1.loadTexture("racket1");
            paddle2.loadTexture("racket2");
        }

        // If the ball object collides with either the top or bottom wall object

        if (body.sprite.key.toString() === "ctop" || body.sprite.key.toString() === "cbottom") {
            wallHits++;
        }


        // If the ball was last hit by paddle1

        if (lastHitBy === 1 && wallHits === 1) {

            // Changes the paddle object's texture to a paddle that indicates scoring a goal is possible

            paddle1.loadTexture("racketWin");
            paddle2.loadTexture("racket2");
        }


        if (lastHitBy === 1 && wallHits > 1) {

            // Assigning points and resetting the position and settings of all objects

            paddle1.destroy();
            paddle2.destroy();
            paddle1 = createRacket(600, game.world.centerY, "r1");
            paddle2 = createRacket(game.world.width - 600, game.world.centerY, "r2");
            emitter1 = addEmission(emitter1, paddle1);
            emitter2 = addEmission(emitter2, paddle2);
            ball.destroy();
            ball = createBall(game.world.centerX, game.world.centerY);
            eventText = "Player 1 scored!!";
            score1 += 1;
            wallHits = 0;
            lastHitBy = 0;
        }


        // If the ball was last hit by paddle2

        if (lastHitBy === 2 && wallHits === 1) {

            // Changes the paddle object's texture to a paddle that indicates scoring a goal is possible

            paddle2.loadTexture("racketWin");
            paddle1.loadTexture("racket1");
        }

        if (lastHitBy === 2 && wallHits > 1) {

            // Assigning points and resetting the position and settings of all objects

            paddle1.destroy();
            paddle2.destroy();
            paddle1 = createRacket(600, game.world.centerY, "r1");
            paddle2 = createRacket(game.world.width - 600, game.world.centerY, "r2");
            emitter1 = addEmission(emitter1, paddle1);
            emitter2 = addEmission(emitter2, paddle2);
            ball.destroy();
            ball = createBall(game.world.centerX, game.world.centerY);
            eventText = "Player 2 scored!!";
            score2 += 1;
            wallHits = 0;
            lastHitBy = 0;
        }

    }

}


function createRacket(x, y, racket) {


    // Check which paddle needs to be made

    if (racket == "r1") {
        racket = "racket1";
    }
    if (racket == "r2") {
        racket = "racket2";
    }

    // Create a paddle object

    var paddle = game.add.sprite(x, y, racket);

    // Paddle settings

    game.physics.p2.enable(paddle, false);
    paddle.body.collideWorldBounds = true;

    return paddle;
}

function addEmission(emitter, paddle) {

    // Create an emitter

    emitter = game.add.emitter(0, 0, 50);

    // Emitter settings and assignment to the paddle object

    emitter.makeParticles('fire');
    paddle.addChild(emitter);
    emitter.y = 128;
    emitter.x = 0;
    emitter.lifespan = 300;
    emitter.gravity = 5000;


    return emitter;

}

function control_paddle1(paddle) {

    // The controls of the first paddle

    // Keyboard w pressed

    if (wKey.isDown) {
        paddle.body.moveForward(300);
        emitter1.emitParticle();
    }

    // Keyboard s pressed

    if (sKey.isDown) {
        paddle.body.moveBackward(100);
    }

    // Keyboard a pressed

    if (aKey.isDown) {
        paddle.body.rotateLeft(50);
    }

    // Keyboard d pressed

    if (dKey.isDown) {
        paddle.body.rotateRight(50);
    }


}

function control_paddle2(paddle) {

    // The controls of the second paddle

    // Keyboard up pressed

    if (cursors.up.isDown) {
        paddle.body.moveForward(300);
        emitter2.emitParticle();
    }

    // Keyboard down pressed

    if (cursors.down.isDown) {
        paddle.body.moveBackward(100);
    }

    // Keyboard left pressed

    if (cursors.left.isDown) {
        paddle.body.rotateLeft(50);
    }

    // Keyboard right pressed

    if (cursors.right.isDown) {
        paddle.body.rotateRight(50);
    }
}

function createBall(x, y) {

    // Creating a new ball object

    var newBall = game.add.sprite(x, y, 'ball');

    // Ball settings

    game.physics.p2.enable(newBall, false);
    newBall.body.mass = 1.4;
    newBall.body.force = 400;

    // Ball is not launched when created

    ball_launched = false;

    return newBall;
}

function createGameBounds(x, y) {

    // Creating the upper half of the circular game bounds object

    circle1 = game.add.sprite(x, y, 'ctop');

    // Settings of the upper half of the bound object

    game.physics.p2.enable(circle1, false);
    circle1.body.clearShapes();
    circle1.body.loadPolygon("bounds", "hctop");
    circle1.body.kinematic = true;

    // Creating the lower half of the circular game bounds object

    circle2 = game.add.sprite(x, y, 'cbottom');

    // Settings of the lower half of the bound object

    game.physics.p2.enable(circle2, false);
    circle2.body.clearShapes();
    circle2.body.loadPolygon("bounds", "hcbottom");
    circle2.body.kinematic = true;


}

function createInnerBounds(x, y) {

    // Border for rackets, if the racket needs to stay inside a certain area
    // This function is for another game mode
    // This function is experimental, and does not work as intended
    // The ball should not collide with this object, but only with the outer walls and the rackets.

    // Creating the upper half of the inner game bounds

    circle3 = game.add.sprite(x, y, 'ictop');

    // Settings of the upper half of the bound object

    game.physics.p2.enable(circle3, false);
    circle3.body.clearShapes();
    circle3.body.loadPolygon("bounds", "invisibleTop");
    circle3.body.kinematic = true;


    // Creating the lower half of the inner game bounds
    circle4 = game.add.sprite(x, y, 'icbottom');

    // Settings of the lower half of the bound object

    game.physics.p2.enable(circle4, false);
    circle4.body.clearShapes();
    circle4.body.loadPolygon("bounds", "invisibleBottom");
    circle4.body.kinematic = true;

}

function launchBall(ball) {

    // Moves the ball object to either left or right at a random speed

    var speed = Math.floor((Math.random() * 1000));
    var posNegOptions = ['-', '+'];
    var posNeg = posNegOptions[Math.floor(Math.random() * posNegOptions.length)];

    if (posNeg === '-') {
        ball.body.moveLeft(speed);
    }

    if (posNeg === '+') {
        ball.body.moveRight(speed);
    }


}




