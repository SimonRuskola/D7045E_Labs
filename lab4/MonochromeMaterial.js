/* Implement a class MonochromeMaterial that extends Material.
● The constructor should take an RGB color as a parameter.
● The ApplyMaterial method should activate the ShaderProgram of the material and
send the color to the program as a uniform. */

class MonochromeMaterial extends Material {
  constructor(gl, color, shader) {
    super(shader.program);
    this.gl = gl;
    this.color = color;
    this.shader = shader;
  }

  applyMaterial(transform) {
    var tMatrix = this.gl.getUniformLocation(this.shader.program, "tMatrix");
    this.gl.uniformMatrix4fv(tMatrix, false, flatten(transform));

    this.shader.activateShader();

  /*   var normalMatrix = mat3();
    normalMatrix = inverse(transpose(mat3(transform)));
    var normalMatrixLocation = this.gl.getUniformLocation(this.shader.program, "normalMatrix");
    this.gl.uniformMatrix3fv(normalMatrixLocation, false, flatten(normalMatrix)); */


    var colorLocation = this.gl.getUniformLocation(this.shader.program, "uColor");
    this.gl.uniform4fv(colorLocation, flatten(this.color));

    
  }
}