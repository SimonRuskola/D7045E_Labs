/* Implement a class Sphere that extends Mesh and represents a sphere.
● When a sphere is created, it is only needed to give radius, latitudeBands, and longitudeBands.
The midpoint of the sphere should be at the origin in the local coordinate system */

class Sphere extends Mesh {
    constructor(radius, gl, shaderProgram) {
        const vertices = [];
        const indices = [];
        const normals = [];

        let latitudeBands = 15;
        let longitudeBands = 15;

        for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            const theta = latNumber * Math.PI / latitudeBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                const phi = longNumber * 2 * Math.PI / longitudeBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;
                const u = 1 - (longNumber / longitudeBands);
                const v = 1 - (latNumber / latitudeBands);

                vertices.push(vec4(radius * x, radius * y, radius * z, 1));
                normals.push(vec3(x, y, z));
            }
        }

        for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
                const first = (latNumber * (longitudeBands + 1)) + longNumber;
                const second = first + longitudeBands + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        super(gl, vertices, indices, normals, shaderProgram);

        this.radius = radius;
        this.latitudeBands = latitudeBands;
        this.longitudeBands = longitudeBands;
    }
}