let canvas;
let gl;
let cubes = [];
let movingCube;
let movingCubeTransform;
let camera;
let shader;
let sceneGraph = new SceneGraph();

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

  createScene();

  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  shader.activateShader();
  camera.activate();

  sceneGraph.draw();


  requestAnimationFrame(render);


  
}

function createScene() {
  let rootNode = new GraphicsNode(gl, null, null, mat4(1)); // Root node with identity transform

  let whiteMaterial = new MonochromeMaterial(gl, vec4(1, 1, 1, 1), shader);
  let blackMaterial = new MonochromeMaterial(gl, vec4(0, 0, 0, 1), shader);

  let cubiodMesh = new Cuboid(0.3, 0.3, 0.3, gl, shader.getProgram());

  // Create chessboard floor
  let floorSize = 8;
  let cubeSize = 0.3;
  let spacing = 0.001; // Add spacing between cubes
  let chessboardNode = new GraphicsNode(gl, null, null, mat4(1)); // Parent node for the chessboard

  for (let i = 0; i < floorSize; i++) {
    for (let j = 0; j < floorSize; j++) {
      let x = (i - floorSize / 2) * (cubeSize + spacing);
      let z = (j - floorSize / 2) * (cubeSize + spacing);
      let y = -2; // Adjust the z position to place the floor at the bottom of the scene
      let transform = mat4(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
      let material = (i + j) % 2 === 0 ? whiteMaterial : blackMaterial;
      let cube = new GraphicsNode(gl, cubiodMesh, material, transform);
      chessboardNode.addChild(cube); // Attach cube to the chessboard node
    }
  }

  rootNode.addChild(chessboardNode); // Attach chessboard node to the root node

  // Set the root node's transform to place it in the scene
  rootNode.setTransform(mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));

  // Add the root node to the scene graph or render it directly
  sceneGraph.addNode(rootNode);
}


window.onload = init;
