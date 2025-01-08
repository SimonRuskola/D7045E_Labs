// Tovah Parnes - tovpar-9@student.ltu.se

class Camera {
	constructor(gl, shaderProgram, canvas) {
		this.gl = gl;
		this.shaderProgram = shaderProgram;

		let aspect = canvas.width / canvas.height;
		this.projectionMatrix = perspective(45, aspect, 1, 100);

		let eye = vec3(0, 0, 5);
		let at = vec3(0.0, 0.0, 0.0);
		let up = vec3(0.0, 1.0, 0.0);
		this.viewMatrix = lookAt(eye, at, up);
	}

	activate() {
		let program = this.shaderProgram.getProgram();
		let projectionMatrix = this.gl.getUniformLocation(
			program,
			"u_projectionMatrix"
		);
		this.gl.uniformMatrix4fv(
			projectionMatrix,
			false,
			flatten(this.projectionMatrix)
		);

		let viewMatrix = this.gl.getUniformLocation(program, "u_viewMatrix");
		this.gl.uniformMatrix4fv(viewMatrix, false, flatten(this.viewMatrix));
	}

	getShaderProgram() {
		return this.shaderProgram;
	}
}
