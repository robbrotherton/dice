
const width = 450;
const height = 250;
const nDice = 2;
const diceSize = 80;
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


let sums = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0};
let sumsArray = [0,0,0,0,0,0,0,0,0,0,0]
d3.select("#dice-container")
    .style("width", width)
    .style("height", height)

// create an array of dice face images
var diceFaces = [
    '1.png',
    '2.png',
    '3.png',
    '4.png',
    '5.png',
    '6.png'
];

const backgroundCategory = 0x0001;
const defaultCategory = 0x0002;


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
        background: "transparent",
        width: width,
        height: height,
        wireframes: false,
    }
});

engine.gravity.y = 0;
engine.gravity.x = 0;


Render.run(render);


// Create a runner
const runner = Runner.create();
Runner.run(runner, engine);


// create a container
var container = [];

var boundaryWidth = 100;
var boundaryColor = "black";
var floorStatic = 0;
// background
container.push(Matter.Bodies.rectangle(width / 2, height / 2, width, height, {
    isSensor: true,
    isStatic: true,
    friction: 100,
    frictionStatic: 100,
    collisionFilter: {
        category: backgroundCategory,
        mask: 0
    },
    render: { fillStyle: "transparent" }
}));
// bottom
container.push(Matter.Bodies.rectangle(width / 2, height + boundaryWidth / 2, width, boundaryWidth, {
    isStatic: true,
    collisionFilter: {
        category: defaultCategory,
        mask: defaultCategory
    },
    render: { fillStyle: boundaryColor }
}));
// left
container.push(Matter.Bodies.rectangle(0 - boundaryWidth / 2, height / 2, boundaryWidth, height, {
    isStatic: true,
    collisionFilter: {
        category: defaultCategory,
        mask: defaultCategory
    },
    render: { fillStyle: boundaryColor }
}));
// right
container.push(Matter.Bodies.rectangle(width + boundaryWidth / 2, height / 2, boundaryWidth, height, {
    isStatic: true,
    collisionFilter: {
        category: defaultCategory,
        mask: defaultCategory
    },
    render: { fillStyle: boundaryColor }
}));
//top
container.push(Matter.Bodies.rectangle(width / 2, 0 - boundaryWidth / 2, width, boundaryWidth, {
    isStatic: true,
    collisionFilter: {
        category: defaultCategory,
        mask: defaultCategory
    },
    render: { fillStyle: boundaryColor }
}));
Matter.World.add(engine.world, container);
// add the container and square to the world

// create dice
for (let i = 0; i < nDice; i++) {
    var die = Matter.Bodies.rectangle(width / 2 + (i - 0.5) * diceSize * 1.5, height / 2, diceSize, diceSize, {
        restitution: 0.9,
        friction: 1,
        frictionStatic: 1,
        frictionAir: 0.06,
        sleepThreshold: 15,
        collisionFilter: {
            category: defaultCategory,
            // mask: defaultCategory
        },
        render: {
            fillStyle: "black",
            strokeStyle: "black",
            lineWidth: 5,
            sprite: { texture: diceFaces[0], xScale: spriteScale, yScale: spriteScale }
        },
        chamfer: { radius: [5, 5, 5, 5] }
    });

    dice.push({ body: die, distance: 0, distanceX: 0, distanceY: 0, isRolling: false, face: 0 });

}


Matter.World.add(engine.world, dice.map(d => d.body));


// create a mouse constraint
var mouse = Mouse.create(render.canvas),
    mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            render: { visible: false },
            collisionFilter: {
                category: defaultCategory,
                mask: defaultCategory
            }
        },
    });

// add the mouse constraint to the world
Matter.World.add(engine.world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;






function updateDiceFace(die, distance, spinFactor) {
    // calculate the index of the dice face based on the distance moved
    let faceIndex = Math.floor(distance / diceSize % 6);

    // set the square's image to the corresponding dice face
    die.render.sprite.texture = diceFaces[faceIndex];

    return faceIndex + 1;
}

// create a function to roll the dice
function diceRolled() {

    console.log("rolling");
    clearInterval(shakerInterval);
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
            length: diceSize * 0.77,
            stiffness: 0.2,
            damping: 0.01,
            collisionFilter: {
                category: defaultCategory,
                mask: defaultCategory
            },
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

// Body.setAngle(dice[0].body, )
// add an event listener for the beforeUpdate event
Matter.Events.on(engine, 'beforeUpdate', function (event) {


    if (isRolling) {

        dice.forEach((d) => {
            // if (d.body.velocity.x !== 0 || d.body.velocity.y !== 0) {
            if (d.isRolling) {
                d.distance += Matter.Vector.magnitude(d.body.velocity);
                // d.distanceX += d.body.velocity.x;
                // d.distanceY += d.body.velocity.y;
                res = updateDiceFace(d.body, d.distance, d.spinFactor);

                // console.log(d.distanceX)
                // console.log(d.distanceX / diceSize)

                // figure the bodyAngle and the velocityAngle
                // bring the velocity closer to an angle % 90 deg
                // if (Math.abs(d.distanceX) / diceSize > 1) {
                //     d.distanceX = 0;
                //     d.face = Math.floor((d.face + 1) % 6);
                //     d.body.render.sprite.texture = diceFaces[d.face];
                //     Matter.Body.setVelocity(d.body, {
                //         x: d.body.velocity.x,
                //         y: d.body.velocity.y * 0.5
                //     });
                // }
                // if (Math.abs(d.distanceY) / diceSize > 1) {
                //     d.distanceY = 0;
                //     d.face = Math.floor((d.face + 1) % 6);
                //     d.body.render.sprite.texture = diceFaces[d.face];
                //     Matter.Body.setVelocity(d.body, {
                //         x: d.body.velocity.x * 0.5,
                //         y: d.body.velocity.y
                //     });
                // }
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

            // add the sum to the sums tracker
            let thisSum = result.reduce((a, b) => a + b, 0);

            if (sums.hasOwnProperty(thisSum)) {
                sums[thisSum]++;
            } else {
                sums[thisSum] = 1;
            }

            updateSumsChart();
            results.push({ dice: result, sum: result.reduce((a, b) => a + b, 0) });
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

        // dice.forEach((d) => {
        //     Matter.Body.setAngularSpeed(d, 0.5 - Math.random() * 2);
        // })
    }
});

Events.on(mouseConstraint, "mousedown", function (event) {
    if (!isRolling) {
        dicePickedUp();
        linkDice();
    }
});

var shakerInterval;

function dicePickedUp() {
    console.log("picked up");
    shakerInterval = setInterval(() => {
        shakeDice();
    }, 100)
}

function shakeDice() {
    dice.forEach((d) => {
        d.face = randomFace();
        d.body.render.sprite.texture = diceFaces[d.face];
    });
}


function randomFace() {
    return Math.floor(Math.random() * 6);
}

// Events.on(engine, 'collisionStart', function (event) {
//     const d = dice[0].body
//     const pairs = event.pairs;
//     for (let i = 0; i < pairs.length; i++) {
//         const pair = pairs[i];
//         if (pair.bodyA === d || pair.bodyB === d) {
//             // Get the current angle of the velocity
//             const velocityAngle = Math.atan2(d.velocity.y, d.velocity.x);

//             // Snap the angle to the nearest multiple of 90 degrees
//             const snappedAngle = snapTo90Degrees(velocityAngle);

//             // Calculate the new velocity components
//             const newVelocityX = Math.cos(snappedAngle) * Math.hypot(d.velocity.x, d.velocity.y);
//             const newVelocityY = Math.sin(snappedAngle) * Math.hypot(d.velocity.x, d.velocity.y);

//             // Set the new linear velocity
//             Body.setVelocity(d, { x: newVelocityX * 0.05, y: newVelocityY * 0.05 });

//             // Set the new angular velocity
//             Body.setAngularVelocity(d, Math.sign(d.angularVelocity) * 0.1);
//         }
//     }
// });






// function snapTo90Degrees(angle) {
//     const multiple = Math.round(angle / (Math.PI / 2));
//     return multiple * (Math.PI / 2);
// }


// var diceConstraint1 = Matter.Constraint.create({
//     bodyA: dice[0].body,
//     pointA: { x: 0, y: 0 },
//     // pointB: { x: 0, y: 0 },
//     stiffness: 0.1,
//     angularStiffness: 0.1,
//     render: {
//         visible: true
//     }
// });
// var diceConstraint2 = Matter.Constraint.create({
//     bodyA: dice[1].body,
//     pointA: { x: 0, y: 0 },
//     // pointB: { x: 0, y: 0 },
//     stiffness: 0.9,
//     angularStiffness: 0.01,
//     render: {
//         visible: true
//     }
// });

// // add the constraint to the world
// Matter.World.add(engine.world, [diceConstraint1, diceConstraint2]);



// ========================================================================== //
// SVG
// ========================================================================== //

d3.select("#svg-container")
    .style("width", width)
    .style("height", height)

const svg = d3.select("#svg-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

const rollsChart = svg.append("g")
const sumsChart = svg.append("g")

sumsChart.selectAll("rect").data(sumsArray).enter()
        .append("rect")
        .attr("fill", "#9380fc")
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("x", (d, i) => i * barWidth)
            .attr("y", 0)
            .attr("width", barWidth)
            // .attr("height", 20)

function tallyRolls() {

}

var barWidth = width/11;

function updateSumsChart() {
    // sumsArray = Object.values(sums);
    // console.log("updating chart");
    console.log(sumsArray)

    sumsChart.selectAll("rect")
            .attr("height", d => d * 10)

    // Object.entries(sums).forEach(([key, value]) => {
    //     sumsChart.append("rect")
    //         .attr("fill", "#9380fc")
    //         .attr("stroke", "white")
    //         .attr("stroke-width", 0.5)
    //         .attr("x", (key - 2) * barWidth)
    //         .attr("y", 0)
    //         .attr("width", barWidth)
    //         .attr("height", value * 10)
    //    });
}
