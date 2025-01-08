/* Implement a class Star that extends Mesh and represents a 3D Christmas star.
● When a star is created, it is defined by an integer n > 2, two distances outerDist ≤ innerDist, and a thickness T > 0.
● The star is centered at the origin in its own model space and has two center vertices on the z-axis: one at (0, 0, T / 2) and one at (0, 0, -T / 2).
● The star has n outer vertices and n inner vertices located in the x-y plane (z=0 for all of them). An outer vertex is at distance outerDist from the origin, and an inner vertex is at distance innerDist from the origin.
● One of the n spikes points straight upwards on the positive y-axis.
● Outer and inner vertices alternate around the rim of the star with an angle of π / n radians between consecutive vertices.
● The star has a front and a back side, forming a closed surface without holes.
● In total, the star has 2n + 2 vertices forming 2n triangles.
*/

class Star extends Mesh {
    constructor(n, outerDist, innerDist, T, gl, shaderProgram) {
        const vertices = [];
        const indices = [];
        const normals = [];
        const angleStep = Math.PI / n;

        // Center vertices
        vertices.push(vec4(0, 0, T / 2, 1));  // Front center
        vertices.push(vec4(0, 0, -T / 2, 1)); // Back center

        // Outer and inner vertices
        for (let i = 0; i < 2 * n; i++) {
            const angle = i * angleStep;
            const dist = (i % 2 === 0) ? outerDist : innerDist;
            vertices.push(vec4(dist * Math.cos(angle), dist * Math.sin(angle), 0, 1));
        }

        // Indices for triangles
        for (let i = 2; i < 2 * n + 2; i++) {
            const next = (i === 2 * n + 1) ? 2 : i + 1;
            // Front triangles
            indices.push(0, i, next);
            // Back triangles
            indices.push(1, next, i);

            // Normals for front triangles
            const normalFront = calculateNormal(vertices[0], vertices[i], vertices[next]);
            normals.push(normalFront, normalFront, normalFront);

            // Normals for back triangles
            const normalBack = calculateNormal(vertices[1], vertices[next], vertices[i]);
            normals.push(normalBack, normalBack, normalBack);
        }

        super(gl, vertices, indices, normals, shaderProgram);

        this.n = n;
        this.outerDist = outerDist;
        this.innerDist = innerDist;
        this.T = T;
    }
}

// Helper function to calculate normal vector for a triangle
function calculateNormal(v1, v2, v3) {
    const u = subtract(v2, v1);
    const v = subtract(v3, v1);
    const normal = vec3(
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    );
    return normalize(normal);
}