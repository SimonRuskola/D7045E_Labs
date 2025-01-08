/* Implement a class Cone that extends Mesh and represents a cone.
● When a cone is created, it is only needed to give radius and height. The midpoint of the
base of the cone should be at the origin in the local coordinate system */

class Cone extends Mesh {
    constructor(radius, height, gl, shaderProgram) {
        const r = radius;
        const h = height;
        const segments = 36; // Number of segments to approximate the circular base

        const vertices = [];
        const indices = [];
        const normals = [];

        // Base center vertex
        vertices.push(vec4(0, 0, 0, 1));
        // Base center normal
        normals.push(vec4(0, -1, 0, 0));

        // Base perimeter vertices
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            vertices.push(vec4(r * Math.cos(angle), 0, r * Math.sin(angle), 1));
            // Base perimeter normals
            normals.push(vec4(0, -1, 0, 0));
        }

        // Apex vertex
        vertices.push(vec4(0, h, 0, 1));
        // Apex normal
        normals.push(vec4(0, 1, 0, 0));

        // Base indices
        for (let i = 1; i <= segments; i++) {
            indices.push(0, i, i % segments + 1);
        }

        // Side indices
        const apexIndex = vertices.length - 1;
        for (let i = 1; i <= segments; i++) {
            indices.push(i, apexIndex, i % segments + 1);
            // Side normals
            const angle = (i / segments) * 2 * Math.PI;
            const normal = vec4(Math.cos(angle), r / Math.sqrt(r * r + h * h), Math.sin(angle), 0);
            normals.push(normal);
        }

        super(gl, vertices, indices, normals,  shaderProgram);

        this.radius = radius;
        this.height = height;
        this.normals = normals;
    }
}