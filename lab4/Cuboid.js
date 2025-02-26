/* Implement a class Cuboid that extends Mesh and represents a cuboid.
● When a cuboid is created, it is only needed to give width, depth, and height, that is
the total extensions in the x, y, and z directions respectively. The midpoint of the
cuboid should be at the origin in the local coordinate system */

class Cuboid extends Mesh {
    constructor(width, height, depth, gl, shaderProgram) {
        const w = width / 2;
        const h = height / 2;
        const d = depth / 2;

         const vertices = [
            vec4(-w, -h, d, 1), vec4(-w, h, d, 1),
            vec4(w, h, d, 1), vec4(w, -h, d, 1),
            vec4(-w, -h, -d, 1), vec4(-w, h, -d, 1),
            vec4(w, h, -d, 1), vec4(w, -h, -d, 1)
        ];

        const indices = [
            0, 1, 2, 
            2, 3, 0,

            2, 3, 7, 
            7, 6, 2,

            3, 0, 4, 
            4, 7, 3,

            6, 5, 7, 
            1, 2, 6,

            4, 5, 6, 
            6, 7, 4,

            5, 4, 0, 
            0, 1, 5
        ];

        const normals = calculateNormals(vertices, indices);
       /*  const normals = [
            vec4(0, 0, 1, 0), vec4(0, 0, 1, 0),
            vec4(0, 0, 1, 0), vec4(0, 0, 1, 0),
            vec4(0, 0, -1, 0), vec4(0, 0, -1, 0),
            vec4(0, 0, -1, 0), vec4(0, 0, -1, 0),
            vec4(-1, 0, 0, 0), vec4(-1, 0, 0, 0),
            vec4(-1, 0, 0, 0), vec4(-1, 0, 0, 0),
            vec4(1, 0, 0, 0), vec4(1, 0, 0, 0),
            vec4(1, 0, 0, 0), vec4(1, 0, 0, 0),
            vec4(0, 1, 0, 0), vec4(0, 1, 0, 0),
            vec4(0, 1, 0, 0), vec4(0, 1, 0, 0),
            vec4(0, -1, 0, 0), vec4(0, -1, 0, 0),
            vec4(0, -1, 0, 0), vec4(0, -1, 0, 0)
        ];  */

        //const cubeModel = cube(1);

        // Extract vertices, indices, and normals
        /* const vertices = cubeModel.vertexPositions;
        const indices = cubeModel.indices;
        const normals = cubeModel.vertexNormals; */



        super(gl, vertices, indices, normals, shaderProgram);

        this.width = width;
        this.height = height;
        this.depth = depth;
    }


    
}

function calculateNormals(vertices, indices) {
	let normals = [];
	for (let i = 0; i < vertices.length; i++) {
		normals.push(vec3());
	}
	for (let i = 0; i < indices.length; i += 3) {
		let v1 = vertices[indices[i]];
		let v2 = vertices[indices[i + 1]];
		let v3 = vertices[indices[i + 2]];
		let normal = cross(subtract(v2, v1), subtract(v3, v1));
		normal = normalize(normal);

		normals[indices[i]] = add(normals[indices[i]], normal);
		normals[indices[i + 1]] = add(normals[indices[i + 1]], normal);
		normals[indices[i + 2]] = add(normals[indices[i + 2]], normal);
	}

	return normals;
}