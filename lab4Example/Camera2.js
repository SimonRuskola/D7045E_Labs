/* 
  Class Camera for a simple camera (or “eye”). 
  The camera defines a view matrix and a perspective matrix, in terms of its parameters.
  The view/projection is then to be used on all graphics nodes when they are rendered.
*/

class Camera {
  constructor(gl, shaderProgram) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;

    // Camera parameters
    this.radius = 4;
    this.theta = 0.0;
    this.fieldOfView = 40;
    this.aspect = gl.canvas.width / gl.canvas.height;
    this.near = 1;
    this.far = 100;

    // Camera position and orientation
    this.eye = [this.radius * Math.sin(this.theta) * Math.cos(Math.PI),
                this.radius * Math.sin(this.theta) * Math.sin(Math.PI),
                this.radius * Math.cos(this.theta)];
    this.at = [0.0, -1.6, 0.0];
    this.up = [0.0, 1.0, 0.0];

    // View and projection matrices
    this.vMatrix = this.lookAt(this.eye, this.at, this.up);
    this.pMatrix = this.perspective(this.fieldOfView, this.aspect, this.near, this.far);
    this.nMatrix = this.normalMatrix(this.vMatrix);

    // Movement parameters
    this.maxVelocity = 0.1;
    this.friction = 0.98;
    this.velocity = [0.0, 0.0, 0.0];
    this.angularVelocity = [0.0, 0.0];
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
    const nMatrixLocation = this.gl.getUniformLocation(this.shaderProgram, "normalMatrix");

    // Set uniform values
    this.gl.uniformMatrix4fv(pMatrixLocation, false, this.pMatrix);
    this.gl.uniformMatrix4fv(vMatrixLocation, false, this.vMatrix);
    this.gl.uniformMatrix3fv(nMatrixLocation, false, this.nMatrix);
  }

  tiltUp(deltaTime) {
    const tiltAngle = this.angularVelocity[0] * deltaTime;
    const cosAngle = Math.cos(tiltAngle);
    const sinAngle = Math.sin(tiltAngle);
    const direction = this.normalize([
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ]);
    const right = this.cross(direction, this.up);
    const newDirection = [
      direction[0] * cosAngle + this.up[0] * sinAngle,
      direction[1] * cosAngle + this.up[1] * sinAngle,
      direction[2] * cosAngle + this.up[2] * sinAngle
    ];
    this.at = [
      this.eye[0] + newDirection[0],
      this.eye[1] + newDirection[1],
      this.eye[2] + newDirection[2]
    ];
  }

  tiltDown(deltaTime) {
    const tiltAngle = this.angularVelocity[0] * deltaTime;
    const cosAngle = Math.cos(tiltAngle);
    const sinAngle = Math.sin(tiltAngle);
    const direction = this.normalize([
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ]);
    const right = this.cross(direction, this.up);
    const newDirection = [
      direction[0] * cosAngle + this.up[0] * sinAngle,
      direction[1] * cosAngle + this.up[1] * sinAngle,
      direction[2] * cosAngle + this.up[2] * sinAngle
    ];
    this.at = [
      this.eye[0] + newDirection[0],
      this.eye[1] + newDirection[1],
      this.eye[2] + newDirection[2]
    ];
  }

  tiltLeft(deltaTime) {
    const tiltAngle = this.angularVelocity[1] * deltaTime;
    const cosAngle = Math.cos(tiltAngle);
    const sinAngle = Math.sin(tiltAngle);
    const direction = this.normalize([
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ]);
    const newDirection = [
      direction[0] * cosAngle - direction[2] * sinAngle,
      direction[1],
      direction[0] * sinAngle + direction[2] * cosAngle
    ];
    this.at = [
      this.eye[0] + newDirection[0],
      this.eye[1] + newDirection[1],
      this.eye[2] + newDirection[2]
    ];
  }

  tiltRight(deltaTime) {
    const tiltAngle = this.angularVelocity[1] * deltaTime;
    const cosAngle = Math.cos(tiltAngle);
    const sinAngle = Math.sin(tiltAngle);
    const direction = this.normalize([
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ]);
    const newDirection = [
      direction[0] * cosAngle - direction[2] * sinAngle,
      direction[1],
      direction[0] * sinAngle + direction[2] * cosAngle
    ];
    this.at = [
      this.eye[0] + newDirection[0],
      this.eye[1] + newDirection[1],
      this.eye[2] + newDirection[2]
    ];
  }

  moveForward(deltaTime) {
    const direction = this.normalize([
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ]);
    this.velocity[0] += direction[0] * this.acceleration;
    this.velocity[1] += direction[1] * this.acceleration;
    this.velocity[2] += direction[2] * this.acceleration;
  }

  moveBackward(deltaTime) {
    const direction = this.normalize([
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ]);
    this.velocity[0] -= direction[0] * this.acceleration;
    this.velocity[1] -= direction[1] * this.acceleration;
    this.velocity[2] -= direction[2] * this.acceleration;
  }

  moveLeft(deltaTime) {
    const direction = this.normalize([
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ]);
    const right = this.cross(direction, this.up);
    this.velocity[0] -= right[0] * this.acceleration;
    this.velocity[1] -= right[1] * this.acceleration;
    this.velocity[2] -= right[2] * this.acceleration;
  }

  moveRight(deltaTime) {
    const direction = this.normalize([
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ]);
    const right = this.cross(direction, this.up);
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

    this.angularVelocity = [
      this.angularVelocity[0] * this.friction,
      this.angularVelocity[1] * this.friction
    ];

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
    let direction = [
      this.at[0] - this.eye[0],
      this.at[1] - this.eye[1],
      this.at[2] - this.eye[2]
    ];

    // Normalize direction vector
    direction = this.normalize(direction);

    // Calculate right vector
    const right = this.cross(direction, this.up);

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
    this.velocity = [
      this.velocity[0] * this.friction,
      this.velocity[1] * this.friction,
      this.velocity[2] * this.friction
    ];
    this.angularVelocity = [
      this.angularVelocity[0] * this.friction,
      this.angularVelocity[1] * this.friction
    ];

    this.eye = [
      this.eye[0] + this.velocity[0] * deltaTime,
      this.eye[1] + this.velocity[1] * deltaTime,
      this.eye[2] + this.velocity[2] * deltaTime
    ]; 

    this.at = [
      this.at[0] + this.velocity[0] * deltaTime,
      this.at[1] + this.velocity[1] * deltaTime,
      this.at[2] + this.velocity[2] * deltaTime
    ];

    // Update tilt
    this.updateTilt(direction, deltaTime);

    // Update movement
    this.updateMovement(deltaTime);

    // Update view matrix
    this.vMatrix = this.lookAt(this.eye, this.at, this.up);
  }

  lookAt(eye, at, up) {
    // Implementation of lookAt matrix calculation
    const zAxis = this.normalize([
      eye[0] - at[0],
      eye[1] - at[1],
      eye[2] - at[2]
    ]);
    const xAxis = this.normalize(this.cross(up, zAxis));
    const yAxis = this.cross(zAxis, xAxis);

    return [
      xAxis[0], yAxis[0], zAxis[0], 0,
      xAxis[1], yAxis[1], zAxis[1], 0,
      xAxis[2], yAxis[2], zAxis[2], 0,
      -this.dot(xAxis, eye), -this.dot(yAxis, eye), -this.dot(zAxis, eye), 1
    ];
  }

  perspective(fov, aspect, near, far) {
    // Implementation of perspective matrix calculation
    const f = 1.0 / Math.tan(fov * Math.PI / 360);
    const nf = 1 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ];
  }

  normalMatrix(vMatrix) {
    // Implementation of normal matrix calculation
    const m = [
      vMatrix[0], vMatrix[1], vMatrix[2],
      vMatrix[4], vMatrix[5], vMatrix[6],
      vMatrix[8], vMatrix[9], vMatrix[10]
    ];

    const det = m[0] * (m[4] * m[8] - m[7] * m[5]) -
                m[1] * (m[3] * m[8] - m[6] * m[5]) +
                m[2] * (m[3] * m[7] - m[6] * m[4]);

    const invDet = 1.0 / det;

    return [
      (m[4] * m[8] - m[7] * m[5]) * invDet,
      (m[2] * m[7] - m[1] * m[8]) * invDet,
      (m[1] * m[5] - m[2] * m[4]) * invDet,
      (m[5] * m[6] - m[3] * m[8]) * invDet,
      (m[0] * m[8] - m[2] * m[6]) * invDet,
      (m[2] * m[3] - m[0] * m[5]) * invDet,
      (m[3] * m[7] - m[4] * m[6]) * invDet,
      (m[1] * m[6] - m[0] * m[7]) * invDet,
      (m[0] * m[4] - m[1] * m[3]) * invDet
    ];
  }

  normalize(v) {
    // Implementation of vector normalization
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
  }

  cross(v, w) {
    // Implementation of cross product
    return [
      v[1] * w[2] - v[2] * w[1],
      v[2] * w[0] - v[0] * w[2],
      v[0] * w[1] - v[1] * w[0]
    ];
  }

  dot(v, w) {
    // Implementation of dot product
    return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.activate();

    requestAnimationFrame(() => this.animate());
  }

  getvMatrix() {
    return this.vMatrix;
  }
}
