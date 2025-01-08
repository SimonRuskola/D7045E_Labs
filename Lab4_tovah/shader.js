// Tovah Parnes - tovpar-9@student.ltu.se

class Shader {
	constructor(gl, shaderType, source) {
		if (shaderType == gl.VERTEX_SHADER) {
			this.type = 0;
		} else if (shaderType == gl.FRAGMENT_SHADER) {
			this.type = 1;
		} else {
			throw new Error("Invalid shader type");
		}

		this.shader = gl.createShader(shaderType);
		gl.shaderSource(this.shader, document.getElementById(source).text);
		gl.compileShader(this.shader);

		if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
			alert("Error compiling shader: " + gl.getShaderInfoLog(this.shader));
			gl.deleteShader(this.shader);
			return null;
		}
	}

	getShader() {
		return this.shader;
	}

	getShaderType() {
		return this.type;
	}
}
