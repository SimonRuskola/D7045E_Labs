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
    this.at = vec3(0.0, 1.0, 0.0);
    this.up = vec3(0.0, 1.0, 0.0);

    // View and projection matrices
    this.vMatrix = lookAt(this.eye, this.at, this.up);
    this.pMatrix = perspective(this.fieldOfView, this.aspect, this.near, this.far);

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
    // Get uniform locations
    const pMatrixLocation = this.gl.getUniformLocation(this.shaderProgram, "pMatrix");
    const vMatrixLocation = this.gl.getUniformLocation(this.shaderProgram, "vMatrix");

    // Set uniform values
    this.gl.uniformMatrix4fv(pMatrixLocation, false, flatten(this.pMatrix));
    this.gl.uniformMatrix4fv(vMatrixLocation, false, flatten(this.vMatrix));
  }

  updateTilt(direction, deltaTime) {
    const tiltAngle = this.acceleration* 10 * deltaTime;
    const cosAngle = Math.cos(tiltAngle);
    const sinAngle = Math.sin(tiltAngle);

    if (this.keys['ArrowUp']) {
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

    if (this.keys['ArrowDown']) {
      const right = cross(direction, this.up);
      const newDirection = vec3(
        direction[0] * cosAngle - this.up[0] * sinAngle,
        direction[1] * cosAngle - this.up[1] * sinAngle,
        direction[2] * cosAngle - this.up[2] * sinAngle
      );
      this.at = vec3(
        this.eye[0] + newDirection[0],
        this.eye[1] + newDirection[1],
        this.eye[2] + newDirection[2]
      );
    }

    if (this.keys['ArrowRight']) {
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

    if (this.keys['ArrowLeft']) {
      const newDirection = vec3(
        direction[0] * cosAngle + direction[2] * sinAngle,
        direction[1],
        -direction[0] * sinAngle + direction[2] * cosAngle
      );
      this.at = vec3(
        this.eye[0] + newDirection[0],
        this.eye[1] + newDirection[1],
        this.eye[2] + newDirection[2]
      );
    }
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

    // Update view matrix
    this.vMatrix = lookAt(this.eye, this.at, this.up);
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.activate();

    requestAnimationFrame(() => this.animate());
  }
}
