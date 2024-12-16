let canvas;
let gl;
let cubes = [];
let movingCube;
let movingCubeTransform;
let camera;
let shader;

function init() {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 0.6, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);

  let fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, "fragment-shader");
  let vertexShader = new Shader(gl, gl.VERTEX_SHADER, "vertex-shader");
  shader = new ShaderProgram(gl, vertexShader.getShader(), fragmentShader.getShader());

  camera = new Camera(gl, shader.getProgram());

  let cubeColor = new MonochromeMaterial(gl, vec4(0.5, 0, 0.5, 1), shader);
  let movingCubeColor = new MonochromeMaterial(gl, vec4(1, 1, 1, 1), shader);
  //let cubiodMesh = new Cuboid(0.5, 0.5, 0.5, gl, shader.getProgram());
  let cubiodMesh = new Star(10, 0.2, 0.5, 1,  gl, shader.getProgram());

  movingCubeTransform = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 5, 0, 0, 0, 1);
  movingCube = new GraphicsNode(gl, cubiodMesh, cubeColor, movingCubeTransform);

  let maxX = 15;
  let minX = -15;
  let maxY = 15;
  let minY = -15;
  let maxZ = 0;
  let minZ = -50;

  for (let i = 0; i <= 500; i++) {
    let x = Math.floor(Math.random() * (maxX - minX)) + minX;
    let y = Math.floor(Math.random() * (maxY - minY)) + minY;
    let z = Math.floor(Math.random() * (maxZ - minZ)) + minZ;
    let transform = mat4(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);

    let cube = new GraphicsNode(gl, cubiodMesh, movingCubeColor, transform);
    cubes.push(cube);
  }

  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  shader.activateShader();
  camera.activate();

  movingCube.draw();

  for (let i = 0; i < cubes.length; i++) {
    cubes[i].draw();
  }
}

window.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 87: // W
      movingCubeTransform = add(movingCubeTransform, mat4(0, 0, 0, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 0, 0, 0, 0));
      break;
    case 65: // A
      movingCubeTransform = add(movingCubeTransform, mat4(0, 0, 0, -0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
      break;
    case 83: // S
      movingCubeTransform = add(movingCubeTransform, mat4(0, 0, 0, 0, 0, 0, 0, -0.1, 0, 0, 0, 0, 0, 0, 0, 0));
      break;
    case 68: // D
      movingCubeTransform = add(movingCubeTransform, mat4(0, 0, 0, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
      break;
    case 69: // E
      movingCubeTransform = add(movingCubeTransform, mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.1, 0, 0, 0, 0));
      break;
    case 81: // Q
      movingCubeTransform = add(movingCubeTransform, mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0, 0, 0, 0));
      break;
  }
  movingCube.setTransform(movingCubeTransform);
  render();
});

window.onload = init;
