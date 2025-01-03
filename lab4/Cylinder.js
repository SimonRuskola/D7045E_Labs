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
        const normals = []; // Array to store normals

        // Top circle vertices and normals
        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep;
            vertices.push(vec4(radius * Math.cos(angle), h, radius * Math.sin(angle), 1));
            normals.push(vec4(0, 1, 0, 0)); // Normal pointing up
        }

        // Bottom circle vertices and normals
        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep;
            vertices.push(vec4(radius * Math.cos(angle), -h, radius * Math.sin(angle), 1));
            normals.push(vec4(0, -1, 0, 0)); // Normal pointing down
        }

        // Top center vertex and normal
        vertices.push(vec4(0, h, 0, 1));
        normals.push(vec4(0, 1, 0, 0)); // Normal pointing up

        // Bottom center vertex and normal
        vertices.push(vec4(0, -h, 0, 1));
        normals.push(vec4(0, -1, 0, 0)); // Normal pointing down

        // Top circle indices
        for (let i = 0; i < segments; i++) {
            indices.push(i, (i + 1) % segments, vertices.length - 2);
        }

        // Bottom circle indices
        for (let i = 0; i < segments; i++) {
            indices.push(i + segments, vertices.length - 1, ((i + 1) % segments) + segments);
        }

        // Side vertices and normals
        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep;
            const normal = vec4(Math.cos(angle), 0, Math.sin(angle), 0);
            normals.push(normal); // Normal for top vertex of side
            normals.push(normal); // Normal for bottom vertex of side
        }

        // Side indices
        for (let i = 0; i < segments; i++) {
            const next = (i + 1) % segments;
            indices.push(i, next, i + segments);
            indices.push(next, next + segments, i + segments);
        }

        super(gl, vertices, indices, normals, shaderProgram ); // Pass normals to the Mesh constructor

        this.radius = radius;
        this.height = height;
    }
}