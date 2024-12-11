/* Implement a class MonochromeMaterial that extends Material.
● The constructor should take an RGB color as a parameter.
● The ApplyMaterial method should activate the ShaderProgram of the material and
send the color to the program as a uniform. */


class MonochromeMaterial extends Material {

  constructor(gl, color, shader) {
    super(shader.program);
    this.gl = gl;
    this.color = color;
    this.fColorLocation = null;
    this.shader = shader;
  }
  
  applyMaterial(transform) {
      var tMatrix = this.gl.getUniformLocation(this.shader.program, "tMatrix");
      this.gl.uniformMatrix4fv(tMatrix, false, flatten(transform));
  
      this.fColorLocation = this.gl.getUniformLocation(this.shader.program, "fColor");
      var distance = transform[2][3]/20;
  
      var shadedColor=[];
   
      if (distance != 1) {
        shadedColor[0] = this.color[0] * (1 / (1 - distance));
        shadedColor[1] = this.color[1] * (1 / (1 - distance));
        shadedColor[2] = this.color[2] * (1 / (1 - distance));
        shadedColor[3] = 1;
      }
      this.gl.uniform4fv(this.fColorLocation, flatten(shadedColor));
  }
}