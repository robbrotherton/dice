
const width = 500;
const height = 300;
const nDice = 2;
const diceSize = 50;
const spriteScale = diceSize / 100;

var dice = [], diceDistances = [], rolls = [];
var results = [];
var diceLinks = [];
var linked = false;

// create a variable to track whether the dice is rolling
var isRolling = false;
let allResults = [];
let result = [];
let res;


// create an array of dice face images
var diceFaces = [
    'face1_100x100.png',
    'face2_100x100.png',
    'face3_100x100.png',
    'face4_100x100.png',
    'face5_100x100.png',
    'face6_100x100.png'
];


var { Engine, Render, Runner,
    Composite, Composites, Common,
    Constraint,
    MouseConstraint, Mouse, Events,
    World, Bodies, Body } = Matter;

// create an engine
var engine = Matter.Engine.create();

// create a renderer
var render = Matter.Render.create({
    element: document.getElementById("dice-container"),
    engine: engine,
    showSleeping: true,
    options: {
        width: width,
        height: height,
        wireframes: false
    }
});

engine.gravity.y = 0;
engine.gravity.x = 0;

// create a container
var container = [];

var boundaryWidth = 100;
var boundaryColor = "black";
var floorStatic = 0;
// background
container.push(Matter.Bodies.rectangle(width / 2, height / 2, width, height, {
    isSensor: true,
    isStatic: true,
    friction: floorStatic,
    frictionStatic: floorStatic,
    render: { fillStyle: "white" }
}));
// bottom
container.push(Matter.Bodies.rectangle(width / 2, height + boundaryWidth / 2 - 5, width, boundaryWidth, {
    isStatic: true,
    render: { fillStyle: boundaryColor }
}));
// left
container.push(Matter.Bodies.rectangle(0 - boundaryWidth / 2 + 5, height / 2, boundaryWidth, height, {
    isStatic: true,
    render: { fillStyle: boundaryColor }
}));
// right
container.push(Matter.Bodies.rectangle(width + boundaryWidth / 2 - 5, height / 2, boundaryWidth, height, {
    isStatic: true,
    render: { fillStyle: boundaryColor }
}));
//top
container.push(Matter.Bodies.rectangle(width / 2, 0 - boundaryWidth / 2 + 5, width, boundaryWidth, {
    isStatic: true,
    render: { fillStyle: boundaryColor }
}));
Matter.World.add(engine.world, container);
// add the container and square to the world

// create dice

for (let i = 0; i < nDice; i++) {
    var die = Matter.Bodies.rectangle(width / 2 + (i - 0.5) * diceSize * 1.5, height / 2, diceSize, diceSize, {
        restitution: 0.9,
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0.05,
        sleepThreshold: 15,
        collisionFilter: {category: 0b10},
        render: {
            fillStyle: "black",
            strokeStyle: "black",
            lineWidth: 5,
            sprite: { texture: diceFaces[0], xScale: spriteScale, yScale: spriteScale }
        },
        chamfer: { radius: [5, 5, 5, 5] }
    });

    dice.push({ body: die, distance: 0, isRolling: false });

}


Matter.World.add(engine.world, dice.map(d => d.body));


// create a mouse constraint
var mouseConstraint = Matter.MouseConstraint.create(engine, {
    element: render.canvas,
    collisionFilter: {mask: 0b10}
});

// add the mouse constraint to the world
Matter.World.add(engine.world, mouseConstraint);


// start the engine
Matter.Runner.run(engine);

// run the renderer
Matter.Render.run(render);





function updateDiceFace(die, distance, spinFactor) {
    // calculate the index of the dice face based on the distance moved
    let faceIndex = Math.floor(distance / spinFactor % 6);

    // set the square's image to the corresponding dice face
    die.render.sprite.texture = diceFaces[faceIndex];

    return faceIndex + 1;
}

// create a function to roll the dice
function diceRolled() {

    console.log("rolling");
    Matter.World.remove(engine.world, mouseConstraint);
    // set isRolling to true
    dice.forEach((d) => {
        d.isRolling = true;
        // d.body.collisionFilter = {category: 2};
        // a random number that determines how much 'spin' was put on the dice
        // therefore how quickly the faces change
        d.spinFactor = 5 + Math.floor(Math.random() * 30);
    })
    isRolling = true;

    spinFactor = 5 + Math.floor(Math.random() * 30);
}


function allDiceStoppedRolling() {
    let rolling = dice.map(d => d.isRolling);
    return !rolling.includes(true);
}


function linkDice() {

    linked = true;

    for (let i = 0; i < dice.length - 1; i++) {
        var link = Constraint.create({
            bodyA: dice[i].body,
            bodyB: dice[i + 1].body,
            length: 40,
            stiffness: 0.5,
            damping: 0.001,
            render: { visible: false }
        });

        diceLinks.push(link);
    }


    Composite.add(engine.world, diceLinks);
}

function unlinkDice() {
    linked = false;
    Composite.remove(engine.world, diceLinks);
}


// add an event listener for the beforeUpdate event
Matter.Events.on(engine, 'beforeUpdate', function (event) {

    if (isRolling) {

        dice.forEach((d) => {
            // if (d.body.velocity.x !== 0 || d.body.velocity.y !== 0) {
            if (d.isRolling) {
                d.distance += Matter.Vector.magnitude(d.body.velocity);
                res = updateDiceFace(d.body, d.distance, d.spinFactor);
                
                if (Math.abs(d.body.angularVelocity) < 0.01 && Matter.Vector.magnitude(d.body.velocity) < 0.1) {
                    // diceStopped(d.body);
                    d.isRolling = false;
                    // d.body.collisionFilter = {category: 1};
                    allResults.push(res);
                    result.push(res);
                }   
            }
        })

        if (allDiceStoppedRolling()) {
            isRolling = false;
            results.push({dice: result, sum: result.reduce((a, b) => a + b, 0)});
            console.log(results);
            result = [];
            Matter.World.add(engine.world, mouseConstraint);
        }
    }
});


// add an event listener for the mouse up event
Events.on(mouseConstraint, 'mouseup', function (event) {

    if (linked) {
        unlinkDice();
        diceRolled();
        // apply an impulse to the square in a random direction
        // Matter.Body.applyForce(square, square.position, {
        //     // x: (0.5 - Math.random()),
        //     // y: (0.5 - Math.random()),
        //     z:  (0.5 - Math.random())*0.01
        // });
    
        dice.forEach((d) => {
            Matter.Body.setAngularSpeed(d, 0.5 - Math.random() * 2);
        })
    }
});

Events.on(mouseConstraint, "mousedown", function (event) {
    if (!isRolling) {
        linkDice();
    }
});
