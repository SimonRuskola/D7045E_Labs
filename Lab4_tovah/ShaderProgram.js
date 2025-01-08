// Tovah Parnes - tovpar-9@student.ltu.se

class ShaderProgram {
	constructor(gl, vertexShader, fragmentShader) {
		this.gl = gl;
		this.program = gl.createProgram();
		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;
		this.gl.attachShader(this.program, this.fragmentShader.getShader());
		this.gl.attachShader(this.program, this.vertexShader.getShader());
		gl.linkProgram(this.program);
		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			const info = gl.getProgramInfoLog(this.program);
			throw new Error(`Could not compile WebGL program. \n\n${info}`);
		}
	}

	activate() {
		this.gl.useProgram(this.program);
	}

	getProgram() {
		return this.program;
	}
}
