// Tovah Parnes - tovpar-9@student.ltu.se
class Mesh {
	constructor(gl, vertices, indices, normals, shaderProgram) {
		this.vertices = vertices;
		this.indices = indices;
		this.normals = normals;
		this.gl = gl;

		this.shaderProgram = shaderProgram;

		/*
		let vertexArray = gl.createVertexArray();
		let vertexBuffer = gl.createBuffer();
		let indexBuffer = gl.createBuffer();
		this.normalBuff = gl.createBuffer();

		gl.bindVertexArray(vertexArray);
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuff);

		let verticeArray = new Float32Array(this.vertices);
		let indexArray = new Uint8Array(this.indices);
		let normalArray = new Float32Array(this.normals);

		gl.bufferData(gl.ARRAY_BUFFER, verticeArray, gl.STATIC_DRAW);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
		gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);

		let prog = shaderProgram.getProgram();
		let pos = gl.getAttribLocation(prog, "a_vertexPosition");
		let norm = gl.getAttribLocation(prog, "a_vertexNormal");
		gl.vertexAttribPointer(pos, 4, gl.FLOAT, false, 0, 0);
		gl.vertexAttribPointer(norm, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(pos);
		gl.enableVertexAttribArray(norm);
		*/

		this.vertexArray = gl.createVertexArray();
		gl.bindVertexArray(this.vertexArray);

		this.vertexBuffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();
		this.normalBuff = gl.createBuffer();

		
	}

	activateBuffers() {
        let prog = this.shaderProgram.getProgram();
		let pos = gl.getAttribLocation(prog, "a_vertexPosition");
		let norm = gl.getAttribLocation(prog, "a_vertexNormal");

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		let indexArray = new Uint8Array(this.indices);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		let verticeArray = new Float32Array(this.vertices);
		gl.bufferData(gl.ARRAY_BUFFER, verticeArray, gl.STATIC_DRAW);


		gl.vertexAttribPointer(pos, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(pos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuff);
		let normalArray = new Float32Array(this.normals);
		gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);

		gl.vertexAttribPointer(norm, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(norm);
    }

	getIndices() {
		return this.indices;
	}

	getVertices() {
		return this.vertices;
	}
}

class Cuboid extends Mesh {
	constructor(gl, width, height, depth, shaderProgram) {
		const w = width / 2;
		const h = height / 2;
		const d = depth / 2;

		const vertices = [
			vec4(-w, -h, d, 1),
			vec4(-w, h, d, 1),
			vec4(w, h, d, 1),
			vec4(w, -h, d, 1),
			vec4(-w, -h, -d, 1),
			vec4(-w, h, -d, 1),
			vec4(w, h, -d, 1),
			vec4(w, -h, -d, 1),
		];

		let indices = [
			1, 0, 3, 3, 2, 1, 2, 3, 7, 7, 6, 2, 3, 0, 4, 4, 7, 3, 6, 5, 1, 1, 2, 6, 4,
			5, 6, 6, 7, 4, 5, 4, 0, 0, 1, 5,
		];

		const normals = calculateNormals(vertices, indices);
		super(gl, flatten(vertices), indices, flatten(normals), shaderProgram);

		this.w = w;
		this.h = h;
		this.d = d;
	}

	// Getters
	getSize() {
		return [this.w, this.h, this.d];
	}
}

class Sphere extends Mesh {
	constructor(gl, radius, slices, stacks, shaderProgram) {
		if (radius <= 0) throw new Error("radus can not be negative or zero");
		if (slices < 2) throw new Error("there must be at least 2 slices");
		if (stacks < 2) throw new Error("there must be at least 2 stacks");
		const vertices = [];
		const indices = [];
		const normals = [];

		for (let currStack = 0; currStack <= stacks; currStack++) {
			const theta = (currStack * Math.PI) / stacks;
			const sinTheta = Math.sin(theta);
			const cosTheta = Math.cos(theta);

			for (let currSlice = 0; currSlice <= slices; currSlice++) {
				const phi = (currSlice * 2 * Math.PI) / slices;
				const sinPhi = Math.sin(phi);
				const cosPhi = Math.cos(phi);

				const x = cosPhi * sinTheta;
				const y = cosTheta;
				const z = sinPhi * sinTheta;

				vertices.push(vec4(radius * x, radius * y, radius * z, 1));
				normals.push(vec3(x, y, z));
			}
		}

		for (let currStack = 0; currStack < stacks; currStack++) {
			for (let currSlice = 0; currSlice < slices; currSlice++) {
				const first = currStack * (slices + 1) + currSlice;
				const second = first + slices + 1;

				indices.push(first, second, first + 1);
				indices.push(second, second + 1, first + 1);
			}
		}
		super(gl, flatten(vertices), indices, flatten(normals), shaderProgram);

		this.radius = radius;
		this.stacks = stacks;
		this.slices = slices;
	}
}

class Star extends Mesh {
	constructor(gl, points, outerDist, innerDist, thickness, shaderProgram) {
		if (points < 2) throw new Error("there must be at least 2 points");
		if (outerDist < innerDist)
			throw new Error("outerDist must be bigger or the same as innerDist");
		if (thickness <= 0) throw new Error("thickness must be bigger than 0");

		const vertices = [];
		const indices = [];

		let frontCenter = vec4(0.0, 0.0, thickness / 2.0, 1.0);
		let backCenter = vec4(0.0, 0.0, -thickness / 2.0, 1.0);

		const angleStep = Math.PI / points;

		vertices.push(frontCenter); // Front center
		vertices.push(backCenter); // Back center

		// Outer and inner vertices
		for (let i = 0; i < 2 * points; i++) {
			const angle = i * angleStep;
			const dist = i % 2 === 0 ? outerDist : innerDist;
			vertices.push(vec4(dist * Math.cos(angle), dist * Math.sin(angle), 0, 1));
		}

		// Indices for triangles
		for (let i = 2; i < 2 * points + 2; i++) {
			const next = i === 2 * points + 1 ? 2 : i + 1;
			// Front triangles
			indices.push(0, i, next);
			// Back triangles
			indices.push(1, next, i);
		}

		const normals = calculateNormals(vertices, indices);
		super(gl, flatten(vertices), indices, flatten(normals), shaderProgram);

		this.points = points;
		this.outerDist = outerDist;
		this.innerDist = innerDist;
		this.thickness = thickness;
	}
}

class Torus extends Mesh {
	constructor(gl, innerRadius, outerRadius, segments, shaderProgram) {
		if (innerRadius <= 0)
			throw new Error("inner radius can not be negative or zero");
		if (outerRadius <= innerRadius)
			throw new Error("outer radius must be bigger than the inner radius");
		if (segments < 3) throw new Error("there must be at least 3 segments");

		const vertices = [];
		const indices = [];

		let numSegments = segments;
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

				const nx = cosPhi * cosTheta;
				const ny = cosPhi * sinTheta;
				const nz = sinPhi;

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

		const normals = calculateNormals(vertices, indices);
		super(gl, flatten(vertices), indices, flatten(normals), shaderProgram);

		this.innerRadius = innerRadius;
		this.outerRadius = outerRadius;
		this.numSegments = numSegments;
	}
}

class Cone extends Mesh {
	constructor(gl, width, height, slices, shaderProgram) {
		if (width <= 0.0 || height <= 0.0) {
			throw "Cone width and height must be greater than 0";
		}
		if (slices < 3) {
			throw "Cone slices must be greater than 3";
		}

		let vertices = [];
		let indices = [];

		let topPoint = vec4(0.0, height / 2, 0.0, 1.0);
		let bottomMiddlePoint = vec4(0.0, -height / 2, 0.0, 1.0);

		let angleStep = (2.0 * Math.PI) / slices;

		vertices.push(bottomMiddlePoint);
		vertices.push(topPoint);

		// vertices
		for (var i = 0; i < slices + 1; i++) {
			var angle = i * angleStep;
			vertices.push(
				vec4(width * Math.cos(angle), -height / 2, width * Math.sin(angle), 1.0)
			);
		}

		// indices
		for (var i = 2; i < vertices.length; i++) {
			let next = i + 1;
			if (next >= vertices.length) {
				next = 2;
			}
			indices.push(0, next, i);
			indices.push(1, next, i);
		}

		const normals = calculateNormals(vertices, indices);
		super(gl, flatten(vertices), indices, flatten(normals), shaderProgram);

		this.width = width;
		this.height = height;
		this.slices = slices;
	}
}

class Cylinder extends Mesh {
	constructor(gl, width, height, slices, shaderProgram) {
		if (width <= 0.0 || height <= 0.0) {
			throw "Cone width and height must be greater than 0";
		}
		if (slices < 3) {
			throw "Cone slices must be greater than 3";
		}

		let vertices = [];
		let indices = [];

		let topmiddlePoint = vec4(0.0, height / 2, 0.0, 1.0);
		let bottomMiddlePoint = vec4(0.0, -height / 2, 0.0, 1.0);

		let angleStep = (2.0 * Math.PI) / slices;

		vertices.push(bottomMiddlePoint);
		vertices.push(topmiddlePoint);

		// vertices
		for (var i = 0; i < slices; i++) {
			var angle = i * angleStep;
			vertices.push(
				vec4(width * Math.cos(angle), -height / 2, width * Math.sin(angle), 1.0)
			);
			vertices.push(
				vec4(width * Math.cos(angle), height / 2, width * Math.sin(angle), 1.0)
			);
		}

		// indices
		for (var i = 2; i < vertices.length; i = i + 2) {
			let currBottom = i;
			let currTop = i + 1;
			let nextBottom = i + 2;
			if (nextBottom >= vertices.length) {
				nextBottom = 2;
			}
			let nextTop = i + 3;
			if (nextTop >= vertices.length) {
				nextTop = 3;
			}

			// Top and bottom
			indices.push(0, currBottom, nextBottom);
			indices.push(1, nextTop, currTop);

			// Sides
			indices.push(currBottom, currTop, nextTop);
			indices.push(currBottom, nextTop, nextBottom);
		}

		const normals = calculateNormals(vertices, indices);
		super(gl, flatten(vertices), indices, flatten(normals), shaderProgram);

		this.width = width;
		this.height = height;
		this.slices = slices;
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
