/* 
  Class Camera for a simple camera (or “eye”). 
  The camera defines a view matrix and a perspective matrix, in terms of its parameters.
  The view/projection is then to be used on all graphics nodes when they are rendered.
*/

class Camera {
  constructor(gl, shaderProgram, canvas) {
    this.gl = gl;
    this.shaderProgram = shaderProgram.getProgram();

    // Camera parameters
    this.radius = 10;
    this.theta = 0.0;
    this.fieldOfView = 40;
    this.aspect = (gl.canvas.width / gl.canvas.height);
    this.near = 0.1;
    this.far = 100;

    // Camera position and orientation
    this.eye = vec3(
      this.radius * Math.sin(this.theta) * Math.cos(Math.PI),
      this.radius * Math.sin(this.theta) * Math.sin(Math.PI),
      this.radius * Math.cos(this.theta)
    );
    this.at = vec3(0.0, -1.6, 0.0);
    this.up = vec3(0.0, 1.0, 0.0);

    // View and projection matrices
    this.vMatrix = lookAt(this.eye, this.at, this.up);
    this.pMatrix = perspective(this.fieldOfView, this.aspect, this.near, this.far);
    /* this.nMatrix = [
        vec3(this.vMatrix[0][0], this.vMatrix[0][1], this.vMatrix[0][2]),
        vec3(this.vMatrix[1][0], this.vMatrix[1][1], this.vMatrix[1][2]),
        vec3(this.vMatrix[2][0], this.vMatrix[2][1], this.vMatrix[2][2])
    ]; */

    this.nMatrix = normalMatrix(this.vMatrix, true);

    

     // Movement parameters
     this.maxVelocity = 0.1;
     this.friction = 0.98;
     this.velocity = vec3(0.0, 0.0, 0.0);
     this.angularVelocity = vec2(0.0, 0.0);
     this.acceleration = 0.05;
 
     // Key states
     this.keys = {};
 
     // Event listeners for keyboard input
     window.addEventListener('keydown', (e) => this.keys[e.key] = true);
     window.addEventListener('keyup', (e) => this.keys[e.key] = false);
 
     // Start the animation loop
     this.lastTime = performance.now();
     this.animate();
  }

  activate() {



	/* 	let projectionMatrix = this.gl.getUniformLocation(this.shaderProgram,"u_projectionMatrix");
		let viewMatrix = this.gl.getUniformLocation(this.shaderProgram, "u_viewMatrix");

		this.gl.uniformMatrix4fv(projectionMatrix, false, flatten(this.projectionMatrix));
		this.gl.uniformMatrix4fv(viewMatrix, false, flatten(this.viewMatrix)); */

    // Get uniform locations
    const projectionMatrix = this.gl.getUniformLocation(this.shaderProgram,"u_projectionMatrix");
    const viewMatrix = this.gl.getUniformLocation(this.shaderProgram, "u_viewMatrix");

    // Set uniform values
    this.gl.uniformMatrix4fv(projectionMatrix, false, flatten(this.pMatrix));
    this.gl.uniformMatrix4fv(viewMatrix, false, flatten(this.vMatrix));
  }

  tiltUp(deltaTime) {
    const tiltAngle = this.angularVelocity[0] * deltaTime;
    const cosAngle = Math.cos(tiltAngle);
    const sinAngle = Math.sin(tiltAngle);
    const direction = normalize(vec3(
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ));
    const right = cross(direction, this.up);
    const newDirection = vec3(
      direction[0] * cosAngle + this.up[0] * sinAngle,
      direction[1] * cosAngle + this.up[1] * sinAngle,
      direction[2] * cosAngle + this.up[2] * sinAngle
    );
    this.at = vec3(
      this.eye[0] + newDirection[0],
      this.eye[1] + newDirection[1],
      this.eye[2] + newDirection[2]
    );
  }

  tiltDown(deltaTime) {
    const tiltAngle = this.angularVelocity[0] * deltaTime;
    const cosAngle = Math.cos(tiltAngle);
    const sinAngle = Math.sin(tiltAngle);
    const direction = normalize(vec3(
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ));
    const right = cross(direction, this.up);
    const newDirection = vec3(
      direction[0] * cosAngle + this.up[0] * sinAngle,
      direction[1] * cosAngle + this.up[1] * sinAngle,
      direction[2] * cosAngle + this.up[2] * sinAngle
    );
    this.at = vec3(
      this.eye[0] + newDirection[0],
      this.eye[1] + newDirection[1],
      this.eye[2] + newDirection[2]
    );
  }

  tiltLeft(deltaTime) {
    const tiltAngle = this.angularVelocity[1] * deltaTime;
    const cosAngle = Math.cos(tiltAngle);
    const sinAngle = Math.sin(tiltAngle);
    const direction = normalize(vec3(
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ));
    const newDirection = vec3(
      direction[0] * cosAngle - direction[2] * sinAngle,
      direction[1],
      direction[0] * sinAngle + direction[2] * cosAngle
    );
    this.at = vec3(
      this.eye[0] + newDirection[0],
      this.eye[1] + newDirection[1],
      this.eye[2] + newDirection[2]
    );
  }

  tiltRight(deltaTime) {
    const tiltAngle = this.angularVelocity[1] * deltaTime;
    const cosAngle = Math.cos(tiltAngle);
    const sinAngle = Math.sin(tiltAngle);
    const direction = normalize(vec3(
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ));
    const newDirection = vec3(
      direction[0] * cosAngle - direction[2] * sinAngle,
      direction[1],
      direction[0] * sinAngle + direction[2] * cosAngle
    );
    this.at = vec3(
      this.eye[0] + newDirection[0],
      this.eye[1] + newDirection[1],
      this.eye[2] + newDirection[2]
    );
  }

  moveForward(deltaTime) {
    const direction = normalize(vec3(
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ));
    this.velocity[0] += direction[0] * this.acceleration;
    this.velocity[1] += direction[1] * this.acceleration;
    this.velocity[2] += direction[2] * this.acceleration;
  }

  moveBackward(deltaTime) {
    const direction = normalize(vec3(
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ));
    this.velocity[0] -= direction[0] * this.acceleration;
    this.velocity[1] -= direction[1] * this.acceleration;
    this.velocity[2] -= direction[2] * this.acceleration;
  }

  moveLeft(deltaTime) {
    const direction = normalize(vec3(
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ));
    const right = cross(direction, this.up);
    this.velocity[0] -= right[0] * this.acceleration;
    this.velocity[1] -= right[1] * this.acceleration;
    this.velocity[2] -= right[2] * this.acceleration;
  }

  moveRight(deltaTime) {
    const direction = normalize(vec3(
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ));
    const right = cross(direction, this.up);
    this.velocity[0] += right[0] * this.acceleration;
    this.velocity[1] += right[1] * this.acceleration;
    this.velocity[2] += right[2] * this.acceleration;
  }

  moveUp(deltaTime) {
    this.velocity[1] += this.acceleration;
  }

  moveDown(deltaTime) {
    this.velocity[1] -= this.acceleration;
  }

  updateTilt(direction, deltaTime) {
    if (this.keys['ArrowUp']) this.angularVelocity[0] += this.acceleration;
    if (this.keys['ArrowDown']) this.angularVelocity[0] -= this.acceleration;
    if (this.keys['ArrowLeft']) this.angularVelocity[1] -= this.acceleration;
    if (this.keys['ArrowRight']) this.angularVelocity[1] += this.acceleration;

    this.angularVelocity = vec2(
      this.angularVelocity[0] * this.friction,
      this.angularVelocity[1] * this.friction
    );

    if (this.keys['ArrowUp']) this.tiltUp(deltaTime);
    if (this.keys['ArrowDown']) this.tiltDown(deltaTime);
    if (this.keys['ArrowLeft']) this.tiltLeft(deltaTime);
    if (this.keys['ArrowRight']) this.tiltRight(deltaTime);
  }

  updateMovement(deltaTime) {
    if (this.keys['w']) this.moveForward(deltaTime);
    if (this.keys['s']) this.moveBackward(deltaTime);
    if (this.keys['a']) this.moveLeft(deltaTime);
    if (this.keys['d']) this.moveRight(deltaTime);
    if (this.keys['q']) this.moveUp(deltaTime);
    if (this.keys['e']) this.moveDown(deltaTime);
  }

  update(deltaTime) {
    // Calculate direction vector
    let direction = vec3(
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    );

    // Normalize direction vector
    direction = normalize(direction);

    // Calculate right vector
    const right = cross(direction, this.up);

    // Update velocities based on key inputs
    if (this.keys['w']) {
      this.velocity[0] += direction[0] * this.acceleration;
      this.velocity[1] += direction[1] * this.acceleration;
      this.velocity[2] += direction[2] * this.acceleration;
    }
    if (this.keys['s']) {
      this.velocity[0] -= direction[0] * this.acceleration;
      this.velocity[1] -= direction[1] * this.acceleration;
      this.velocity[2] -= direction[2] * this.acceleration;
    }
    if (this.keys['a']) {
      this.velocity[0] -= right[0] * this.acceleration;
      this.velocity[1] -= right[1] * this.acceleration;
      this.velocity[2] -= right[2] * this.acceleration;
    }
    if (this.keys['d']) {
      this.velocity[0] += right[0] * this.acceleration;
      this.velocity[1] += right[1] * this.acceleration;
      this.velocity[2] += right[2] * this.acceleration;
    }
    if (this.keys['q']) this.velocity[1] += this.acceleration;
    if (this.keys['e']) this.velocity[1] -= this.acceleration;
    if (this.keys['ArrowUp']) this.angularVelocity[0] += this.acceleration;
    if (this.keys['ArrowDown']) this.angularVelocity[0] -= this.acceleration;
    if (this.keys['ArrowLeft']) this.angularVelocity[1] -= this.acceleration;
    if (this.keys['ArrowRight']) this.angularVelocity[1] += this.acceleration;

    // Apply friction
    this.velocity = vec3(
      this.velocity[0] * this.friction,
      this.velocity[1] * this.friction,
      this.velocity[2] * this.friction
    );
    this.angularVelocity = vec2(
      this.angularVelocity[0] * this.friction,
      this.angularVelocity[1] * this.friction
    );

    this.eye = vec3(
      this.eye[0] + this.velocity[0] * deltaTime,
      this.eye[1] + this.velocity[1] * deltaTime,
      this.eye[2] + this.velocity[2] * deltaTime
    ); 

    this.at = vec3(
      this.at[0] + this.velocity[0] * deltaTime,
      this.at[1] + this.velocity[1] * deltaTime,
      this.at[2] + this.velocity[2] * deltaTime
    );

    // Update tilt
    this.updateTilt(direction, deltaTime);

    // Update movement
    this.updateMovement(deltaTime);

    // Update view matrix
    this.vMatrix = lookAt(this.eye, this.at, this.up);
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    //this.activate();

    requestAnimationFrame(() => this.animate());
  }
}
