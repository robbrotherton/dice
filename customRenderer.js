const CustomRenderer = {};

function customRenderBody(engine, body, context) {
    const { position, angle, render, sprite } = body;

    context.save();
    context.translate(position.x, position.y);
    context.rotate(angle);
    
        // Then, draw the sprite
        if (sprite && sprite.texture) {
            const { texture, xScale, yScale } = sprite;
            const image = engine.render.textures[texture];
    
            if (!image) {
                // Load the texture if it's not already loaded
                engine.render.textures[texture] = image = new Image();
                image.src = texture;
                image.onload = () => {
                    // Trigger a redraw once the texture is loaded
                    engine.render.canvas.width = engine.render.canvas.width;
                };
            } else {
                context.globalAlpha = sprite.opacity !== undefined ? sprite.opacity : 1;
                const { width, height } = image;
                context.drawImage(image, -width * xScale / 2, -height * yScale / 2, width * xScale, height * yScale);
            }
        }

    // First, draw the fill
    if (render.fillStyle) {
        context.fillStyle = render.fillStyle;
        context.globalAlpha = render.opacity !== undefined ? render.opacity : 1;

        if (body.circleRadius) {
            context.beginPath();
            context.arc(0, 0, body.circleRadius, 0, 2 * Math.PI);
            context.fill();
        } else {
            const vertices = body.vertices;
            context.beginPath();
            context.moveTo(vertices[0].x - position.x, vertices[0].y - position.y);
            for (let i = 1; i < vertices.length; i++) {
                context.lineTo(vertices[i].x - position.x, vertices[i].y - position.y);
            }
            context.closePath();
            context.fill();
        }
    }

    context.restore();
}

CustomRenderer.create = function (options) {
    const render = Matter.Render.create(options);
    render.textures = {}; // Initialize the textures object
    render.options.wireframes = false;
  
    // Override the world function
    render.world = function () {
      const context = render.context;
      const world = render.engine.world;
  
      CustomRenderer.clear(render);
      CustomRenderer.background(render, context);
  
      for (const body of Matter.Composite.allBodies(world)) {
        customRenderBody(render, body, context);
      }
    };
  
    return render;
  };

CustomRenderer.run = function (render) {
    (function loop() {
        requestAnimationFrame(loop);
        renderer.world();
    })();
};

CustomRenderer.clear = function (render) {
    const context = render.context;
    const canvas = render.canvas;

    context.clearRect(0, 0, canvas.width, canvas.height);
};

CustomRenderer.background = function (render, context) {
    const canvas = render.canvas;
    context.fillStyle = render
        .options.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomRenderer;
} else {
    window.CustomRenderer = CustomRenderer;
}
