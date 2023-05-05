const { Engine, Render, Runner, World, Bodies, Body, Events, Constraint } = Matter;

// Create an engine
const engine = Engine.create();
const world = engine.world;

// Create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 800,
        height: 600,
        wireframes: false
    }
});

Render.run(render);

// Create a runner
const runner = Runner.create();
Runner.run(runner, engine);

// Create the dice
const diceSize = 40;
const dice = Bodies.rectangle(400, 200, diceSize, diceSize, {
    restitution: 0.5,
    friction: 0.5,
    render: {
        fillStyle: '#F5F5F5',
        strokeStyle: '#000',
        lineWidth: 2
    }
});

// Add the dice to the world
World.add(world, dice);

// Create a ground and walls
const ground = Bodies.rectangle(400, 590, 810, 200, { isStatic: true });
const leftWall = Bodies.rectangle(10, 300, 20, 600, { isStatic: true });
const rightWall = Bodies.rectangle(790, 300, 20, 600, { isStatic: true });
World.add(world, [ground, leftWall, rightWall]);

// Set initial angular velocity
Body.setAngularVelocity(dice, Math.random() * 0.5 - 0.25);

// Event listener for collisions
let constraint = null;
Events.on(engine, 'collisionStart', function (event) {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.bodyA === dice || pair.bodyB === dice) {
            const otherBody = pair.bodyA === dice ? pair.bodyB : pair.bodyA;
            if (!constraint) {
                // Create a constraint at the collision point
                constraint = Constraint.create({
                    bodyA: dice,
                    bodyB: otherBody,
                    pointA: pair.activeContacts[0].vertex,
                    length: 0,
                    stiffness: 1
                });
                World.add(world, constraint);
            }
        }
    }
});

// Event listener for collisions end
Events.on(engine, 'collisionEnd', function (event) {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.bodyA === dice || pair.bodyB === dice) {
            if (constraint) {
                // Remove the constraint
                World.remove(world, constraint);
                constraint = null;
            }
        }
    }
});
