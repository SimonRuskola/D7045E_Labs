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
  let wallMaterial = new MonochromeMaterial(gl, vec4(0.5, 0.5, 0.5, 1), shader); // Material for walls

  
  // Create chessboard floor
  let floorSize = 8;
  let cubeSize = 0.2;
  let spacing = 0.001; // Add spacing between cubes
  let chessboardNode = new GraphicsNode(gl, null, null, mat4(1)); // Parent node for the chessboard
  let cubiodMesh = new Cuboid(cubeSize, cubeSize, cubeSize, gl, shader.getProgram());

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

  // Create walls for the labyrinth
  let wallHeight = 0.4;
  let wallThickness = 0.1; // Adjusted wall thickness
  let wallMesh = new Cuboid(wallThickness, wallHeight, cubeSize, gl, shader.getProgram());

  // Define maze wall positions
  let mazeWalls = [
    { x: -0.3, z: 0.2, scaleX: 1, scaleZ: 5.8},
    { x: 0.3, z: -0.2, scaleX: 1, scaleZ: 5.8},
    { x: 0, z: 0.6, scaleX: 1, scaleZ: 2.8},
    { x: 0, z: -0.6, scaleX: 1, scaleZ: 2.8},

  ];

  mazeWalls.forEach(pos => {
    let transform = mat4(
      pos.scaleX || 1, 0, 0, pos.x,
      0, 1, 0, -1.7 + spacing,
      0, 0, pos.scaleZ || 1, pos.z,
      0, 0, 0, 1
    );
    let wall = new GraphicsNode(gl, wallMesh, wallMaterial, transform);
    rootNode.addChild(wall);
  });

  // Create robot
  let robotNode = new GraphicsNode(gl, null, null, mat4(1)); // Root node for the robot

  let bodyMaterial = new MonochromeMaterial(gl, vec4(0.8, 0.2, 0.2, 1), shader);
  let limbMaterial = new MonochromeMaterial(gl, vec4(0.2, 0.2, 0.8, 1), shader);
  let handMaterial = new MonochromeMaterial(gl, vec4(0.2, 0.8, 0.2, 1), shader);
  let footMaterial = new MonochromeMaterial(gl, vec4(0.8, 0.8, 0.2, 1), shader);
  let starMaterial = new MonochromeMaterial(gl, vec4(0.8, 0.8, 0.2, 1), shader);

  let bodyMesh = new Cuboid(0.4, 0.6, 0.2, gl, shader.getProgram());
  let limbMesh = new Cuboid(0.1, 0.4, 0.1, gl, shader.getProgram());
  let handMesh = new Sphere(0.1, gl, shader.getProgram());
  let footMesh = new Cone(0.1, 0.1, gl, shader.getProgram());
  let headMesh = new Cuboid(0.3, 0.3, 0.3, gl, shader.getProgram());
  let hatMesh = new Star(5, 0.3, 0.2, 0.1, gl, shader.getProgram());



  // Body
  let bodyTransform = mat4(0.5, 0, 0, 0, 0, 0.5, 0, -1.52, 0, 0, 0.5, 0, 0, 0, 0, 1);
  let bodyNode = new GraphicsNode(gl, bodyMesh, bodyMaterial, bodyTransform);
  robotNode.addChild(bodyNode);

  // Head
  let headTransform = mat4(1, 0, 0, 0, 0, 1, 0, 0.45, 0, 0, 1, 0, 0, 0, 0, 1);
  let headNode = new GraphicsNode(gl, headMesh, bodyMaterial, headTransform);
  bodyNode.addChild(headNode);

  // Hat
  let hatTransform = mat4(1, 0, 0, 0, 0, 1, 0, 0.4, 0, 0, 1, 0, 0, 0, 0, 1);
  let hatNode = new GraphicsNode(gl, hatMesh, starMaterial, hatTransform);
  headNode.addChild(hatNode);

  // Left Arm
  let leftArmTransform = mat4(1, 0, 0, -0.25, 0, 1, 0, 0.1, 0, 0, 1, 0, 0, 0, 0, 1);
  let leftArmNode = new GraphicsNode(gl, limbMesh, limbMaterial, leftArmTransform);
  bodyNode.addChild(leftArmNode);

  // Right Arm
  let rightArmTransform = mat4(1, 0, 0, 0.25, 0, 1, 0, 0.1, 0, 0, 1, 0, 0, 0, 0, 1);
  let rightArmNode = new GraphicsNode(gl, limbMesh, limbMaterial, rightArmTransform);
  bodyNode.addChild(rightArmNode);

  // Left Hand
  let leftHandTransform = mat4(1, 0, 0, 0, 0, 1, 0, -0.3, 0, 0, 1, 0, 0, 0, 0, 1);
  let leftHandNode = new GraphicsNode(gl, handMesh, handMaterial, leftHandTransform);
  leftArmNode.addChild(leftHandNode);

  // Right Hand
  let rightHandTransform = mat4(1, 0, 0, 0, 0, 1, 0, -0.3, 0, 0, 1, 0, 0, 0, 0, 1);
  let rightHandNode = new GraphicsNode(gl, handMesh, handMaterial, rightHandTransform);
  rightArmNode.addChild(rightHandNode);

  // Left Leg
  let leftLegTransform = mat4(1, 0, 0, -0.15, 0, 1, 0, -0.5, 0, 0, 1, 0, 0, 0, 0, 1);
  let leftLegNode = new GraphicsNode(gl, limbMesh, limbMaterial, leftLegTransform);
  bodyNode.addChild(leftLegNode);

  // Right Leg
  let rightLegTransform = mat4(1, 0, 0, 0.15, 0, 1, 0, -0.5, 0, 0, 1, 0, 0, 0, 0, 1);
  let rightLegNode = new GraphicsNode(gl, limbMesh, limbMaterial, rightLegTransform);
  bodyNode.addChild(rightLegNode);

  // Left Foot
  let leftFootTransform = mat4(1, 0, 0, 0, 0, 1, 0, -0.25, 0, 0, 1, 0, 0, 0, 0, 1);
  let leftFootNode = new GraphicsNode(gl, footMesh, footMaterial, leftFootTransform);
  leftLegNode.addChild(leftFootNode);

  // Right Foot
  let rightFootTransform = mat4(1, 0, 0, 0, 0, 1, 0, -0.25, 0, 0, 1, 0, 0, 0, 0, 1);
  let rightFootNode = new GraphicsNode(gl, footMesh, footMaterial, rightFootTransform);
  rightLegNode.addChild(rightFootNode);

  rootNode.addChild(robotNode); // Attach robot node to the root node

  // Set the root node's transform to place it in the scene
  rootNode.setTransform(mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));

  // Add the root node to the scene graph or render it directly
  sceneGraph.addNode(rootNode);
}

window.onload = init;
