/* Implement a class Torus that extends Mesh and represents a torus.
● When a torus is created, it is needed to give inner radius, outer radius, and the number of segments.
The midpoint of the torus should be at the origin in the local coordinate system */

class Torus extends Mesh {
    constructor(innerRadius, outerRadius, gl, shaderProgram) {
        const vertices = [];
        const indices = [];
        let numSegments = 15;
        const ringRadius = (outerRadius - innerRadius) / 2;
        const centerRadius = innerRadius + ringRadius;

        for (let i = 0; i < numSegments; i++) {
            const theta = (i / numSegments) * 2 * Math.PI;
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);

            for (let j = 0; j < numSegments; j++) {
                const phi = (j / numSegments) * 2 * Math.PI;
                const cosPhi = Math.cos(phi);
                const sinPhi = Math.sin(phi);

                const x = (centerRadius + ringRadius * cosPhi) * cosTheta;
                const y = (centerRadius + ringRadius * cosPhi) * sinTheta;
                const z = ringRadius * sinPhi;

                vertices.push(vec4(x, y, z, 1));

                const nextI = (i + 1) % numSegments;
                const nextJ = (j + 1) % numSegments;

                indices.push(
                    i * numSegments + j,
                    nextI * numSegments + j,
                    nextI * numSegments + nextJ,
                    i * numSegments + j,
                    nextI * numSegments + nextJ,
                    i * numSegments + nextJ
                );
            }
        }

        super(gl, vertices, indices, shaderProgram);

        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.numSegments = numSegments;
    }
}