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

        //send the transform
        var tMatrix = this.gl.getUniformLocation(this.shader.program, "tMatrix");
        this.gl.uniformMatrix4fv(tMatrix, false, flatten(transform));

        this.fColorLocation = this.gl.getUniformLocation(this.shader.program, "fColor");

        //transform[2][3] is between -40 and 20, divided with camera radius 10
        var distance = transform[2][3]/10;

        var newColor=[];
        //if distance is 1 the node is up close and it's original color should remain
        if(distance == 1) {
            this.gl.uniform4fv(this.fColorLocation, flatten(this.color));
        } else {
            //if the node is far away the RBG variables gets multiplied with lower values => darker color
            newColor[0] = this.color[0] * (1/(1-distance));
            newColor[1] = this.color[1] * (1/(1-distance));
            newColor[2] = this.color[2] * (1/(1-distance));
            newColor[3] = 1;
            this.gl.uniform4fv(this.fColorLocation, flatten(newColor));
        }
    }

}