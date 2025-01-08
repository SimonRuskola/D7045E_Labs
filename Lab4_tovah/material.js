// Tovah Parnes - tovpar-9@student.ltu.se

class material {
	constructor(gl, shaderProgram) {
		this.gl = gl;
		this.shaderProgram = shaderProgram;
	}

	applyMaterial() {
		throw new Error("abstract method, must be implemented");
	}
}

class MonoMaterial extends material {
	constructor(gl, shaderProgram, color) {
		super(gl, shaderProgram);
		this.color = color;
	}

	applyMaterial(transformMatrix) {
		let program = this.shaderProgram.getProgram();

		let colorLocation = this.gl.getUniformLocation(program, "u_color");
		let flattenedColor = flatten(this.color);
		this.gl.uniform4fv(colorLocation, flattenedColor);

		let transformLocation = this.gl.getUniformLocation(
			program,
			"u_transformMatrix"
		);
		this.gl.uniformMatrix4fv(
			transformLocation,
			false,
			flatten(transformMatrix)
		);

		let normalMat = mat3();
		normalMat = normalMatrix(transformMatrix, true);
		var normalMatrixLocation = this.gl.getUniformLocation(
			program,
			"u_normalMatrix"
		);
		this.gl.uniformMatrix3fv(normalMatrixLocation, false, flatten(normalMat));


		
	}
}
