/* Implement a class Cylinder that extends Mesh and represents a cylinder.
● When a cylinder is created, it is only needed to give radius and height.
The midpoint of the cylinder should be at the origin in the local coordinate system */

class Cylinder extends Mesh {
    constructor(radius, height, gl, shaderProgram) {
        const h = height / 2;
        const segments = 36; // Number of segments to approximate the circle
        const angleStep = (2 * Math.PI) / segments;

        const vertices = [];
        const indices = [];

        // Top circle vertices
        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep;
            vertices.push(vec4(radius * Math.cos(angle), h, radius * Math.sin(angle), 1));
        }

        // Bottom circle vertices
        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep;
            vertices.push(vec4(radius * Math.cos(angle), -h, radius * Math.sin(angle), 1));
        }

        // Top center vertex
        vertices.push(vec4(0, h, 0, 1));
        // Bottom center vertex
        vertices.push(vec4(0, -h, 0, 1));

        // Top circle indices
        for (let i = 0; i < segments; i++) {
            indices.push(i, (i + 1) % segments, vertices.length - 2);
        }

        // Bottom circle indices
        for (let i = 0; i < segments; i++) {
            indices.push(i + segments, vertices.length - 1, ((i + 1) % segments) + segments);
        }

        // Side indices
        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            indices.push(i, next, i + segments);
            indices.push(next, next + segments, i + segments);
        }

        super(gl, vertices, indices, shaderProgram);

        this.radius = radius;
        this.height = height;
    }
}