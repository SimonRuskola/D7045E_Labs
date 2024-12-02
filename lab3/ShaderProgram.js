/* Implement a class ShaderProgram that takes a vertex shader instance and a
fragment shader instance (both being Shader objects), and links them into a GL
Shader program.
● Add a method, called activate, that, when called, activates the GL shader program
(via glUseProgram). */

class ShaderProgram {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;
        this.program = gl.createProgram();
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        this.gl.attachShader(this.program, this.fragmentShader);
        this.gl.attachShader(this.program, this.vertexShader);
        this.gl.linkProgram(this.program);
    }
  
    /*a method that activates the GL shader program (via glUseProgram)*/
    activateShader() {
        this.gl.useProgram(this.program);
    }
  
    getProgram() {
        return this.program;
    }
  }