const { Engine, World, Bodies } = Matter;

const engine = Engine.create();
const renderer = CustomRenderer.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    background: "pink",
  },
});

const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVDhPjY9BEoAwCAXLVUgx9r8TzDdTVjORiPmDgFhQwKdw3qCa0wcTAP0Mk1TjKDbwuH2ggXUhaAF6oAVa6gC0Ac1MNQA6QK1LbgAwfNxF0P6O9AAAAABJRU5ErkJggg==";

const bodyWithSpriteAndFill = Bodies.circle(100, 100, 50, {
  isStatic: true,
  render: {
    sprite: {
      texture: base64Image,
      xScale: 1,
      yScale: 1,
    },
    fillStyle: "green",
    opacity: 1,
  },
});

const body1 = Bodies.rectangle(300, 100, 100, 100, {
  isStatic: true,
  render: {
    sprite: {
      texture: base64Image,
      xScale: 1,
      yScale: 1,
    },
    fillStyle: "#0f0",
    opacity: 1,
  },
});

World.add(engine.world, body1);
World.add(engine.world, bodyWithSpriteAndFill);

Engine.run(engine);
CustomRenderer.run(renderer);