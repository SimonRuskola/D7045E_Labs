// Tovah Parnes - tovpar-9@student.ltu.se

class GraphicsNode {
	constructor(gl, mesh, material, transform) {
		this.gl = gl;
		this.mesh = mesh;
		this.material = material;
		this.transform = transform;
		this.children = [];
	}

	draw(parentTransform = mat4(1)) {

		if (this.material) {
			this.combinedTransform = mult(parentTransform, this.transform);


			this.mesh.activateBuffers();
			this.material.applyMaterial(this.combinedTransform);
			let indicesLength = this.mesh.getIndices().length;
			this.gl.drawElements(
				this.gl.TRIANGLES,
				indicesLength,
				this.gl.UNSIGNED_BYTE,
				0
			); 


		}

		for (let i = 0; i < this.children.length; i++) {
			this.children[i].draw();
		}
	}

	addChild(node) {
		this.children.push(node);
	}


	update(transform) {
		transform = mult(this.transform, transform);
		this.transform = transform;
	}

	setTransform(transform){
		this.transform = transform;
	}
}

class Light extends GraphicsNode {
	constructor(gl, shaderProgram, mesh, material, transform) {
		super(gl, mesh, material, transform);
		this.shaderProgram = shaderProgram;
	}

	applyLight() {
		let prog = this.shaderProgram.getProgram();

		let ambientColor = vec4(0.2, 0.2, 0.2, 1.0);
		let diffuseColor = vec4(0.6, 0.6, 0.6, 1.0);
		let specularColor = vec3(1.0, 1.0, 1.0);

		let ambientColorLoc = gl.getUniformLocation(
			shader.getProgram(),
			"ambientColor"
		);
		let diffuseColorLoc = gl.getUniformLocation(
			shader.getProgram(),
			"diffuseColor"
		);
		let specularColorLoc = gl.getUniformLocation(
			shader.getProgram(),
			"specularColor"
		);
		

		gl.uniform4fv(ambientColorLoc, flatten(ambientColor));
		gl.uniform4fv(diffuseColorLoc, flatten(diffuseColor));
		gl.uniform3fv(specularColorLoc, flatten(specularColor));
	} 
}
