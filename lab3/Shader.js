/* Implement a shader class that takes a shader source code and a shader type, and
compiles it.
● The resulting GL Shader handle should be retrievable by a getter method.
● The shader code should be either a vertex shader or a fragment shader.
● The shader type states whether the code stands for a vertex shader or a fragment
shader. There should be a method that returns the type ((for instance, as an enum).
● Include error checking so a failed compile does not go unnoticed.  */


class Shader {
    constructor(gl, shaderType, source) {
        /*create the shader*/
        this.shader = gl.createShader(shaderType);
        /*upload the shader source*/
        gl.shaderSource(this.shader, document.getElementById(source).text);
        /*compile the shader*/
        gl.compileShader(this.shader)
        /*check if the shader compiled*/
        if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
            alert("Error compiling shader: " + gl.getShaderInfoLog(this.shader));
            gl.deleteShader(this.shader);
            return null;
        }
    }
  
    getShader() {
      return this.shader;
    }
}