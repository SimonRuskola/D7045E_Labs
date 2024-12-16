/* 
  Class Camera for a simple camera (or “eye”). 
  An instance of this camera is stationary in the world, meaning that once it has been
  created and given a location and orientation it cannot be moved.
  The camera defines a view matrix and a perspective matrix, in terms of its parameters.
  The view/projection is then to be used on all graphics nodes when they are rendered.
*/

class Camera {
  constructor(gl, shaderProgram) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;

    // Camera parameters
    this.radius = 10;
    this.theta = 0.0;
    this.fieldOfView = 45;
    this.aspect = gl.canvas.width / gl.canvas.height;
    this.near = 1;
    this.far = 1000;

    // Camera position and orientation
    this.eye = vec3(
      this.radius * Math.sin(this.theta) * Math.cos(Math.PI),
      this.radius * Math.sin(this.theta) * Math.sin(Math.PI),
      this.radius * Math.cos(this.theta)
    );
    this.at = vec3(0.0, 0.0, 0.0);
    this.up = vec3(0.0, 1.0, 0.0);

    // View and projection matrices
    this.vMatrix = lookAt(this.eye, this.at, this.up);
    this.pMatrix = perspective(this.fieldOfView, this.aspect, this.near, this.far);
  }

  activate() {
    // Get uniform locations
    const pMatrixLocation = this.gl.getUniformLocation(this.shaderProgram, "pMatrix");
    const vMatrixLocation = this.gl.getUniformLocation(this.shaderProgram, "vMatrix");

    // Set uniform values
    this.gl.uniformMatrix4fv(pMatrixLocation, false, flatten(this.pMatrix));
    this.gl.uniformMatrix4fv(vMatrixLocation, false, flatten(this.vMatrix));
  }
}
