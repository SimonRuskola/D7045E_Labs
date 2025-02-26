let canvas;
let gl;
let cubes = [];
let movingCube;
let movingCubeTransform;
let camera;
let shader;
let sceneGraph = new SceneGraph();

let lightPositionX = 0.0;
let lightPositionY = -1;
let lightPositionZ = 0.0;

let robotNode;
let robotPosition = 0;
let robotDirection = 0.2;
let robotSpeed = 0.003;

let leftArmNode;
let rightArmNode;
let leftArmRotation = 0;
let rightArmRotation = 0;
let armRotationSpeed = 0.02;

let starNode;
let starScale = 1.0;
let starScaleDirection = 0.01;

function init() {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 0.6, 0.2, 1.0);
  
  gl.enable(gl.DEPTH_TEST);

  let fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, "fragment-shader");
  let vertexShader = new Shader(gl, gl.VERTEX_SHADER, "vertex-shader");
  shader = new ShaderProgram(gl, vertexShader.getShader(), fragmentShader.getShader());
  
  // Activate the shader program before setting uniforms
  shader.activateShader();
  
  camera = new Camera(gl, shader.getProgram());
  initLight();

  createScene();



  render();
}

function initLight(){
    // Set up lighting uniforms
    let ambientColor = vec4(0.2, 0.2, 0.2, 1.0);
    let diffuseColor = vec4(1.0, 1.0, 1.0, 1.0);
    let specularColor = vec3(1.0, 1.0, 1.0);
    let lightPosition = vec4(lightPositionX, lightPositionY, lightPositionZ, 1.0); // Position the light source
    let specularExponent = 50.0;
    
    
  
    gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "ambientColor"), flatten(ambientColor));
    gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "diffuseColor"), flatten(diffuseColor));
    gl.uniform3fv(gl.getUniformLocation(shader.getProgram(), "specularColor"), flatten(specularColor));
    gl.uniform4fv(gl.getUniformLocation(shader.getProgram(), "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(shader.getProgram(), "specularExponent"), specularExponent);
}

function updateMovements() {
  // Update robot position
  robotPosition += robotDirection * robotSpeed;
  if (robotPosition > 0.09 || robotPosition < -0.09) {
    robotDirection *= -1; // Reverse direction
  }

  // Update arm rotations
  leftArmRotation += armRotationSpeed;
  rightArmRotation -= armRotationSpeed;

  // Apply updated position to robot transform
  let robotTransform = mat4(1, 0, 0, robotPosition, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  robotNode.setTransform(robotTransform);

  // Apply vertical rotation to left arm
  let leftArmTransform = mat4(
    1, 0, 0, -0.25,
    0, Math.cos(leftArmRotation), -Math.sin(leftArmRotation), 0.1,
    0, Math.sin(leftArmRotation), Math.cos(leftArmRotation), 0,
    0, 0, 0, 1
  );
  leftArmNode.setTransform(leftArmTransform);

  // Apply vertical rotation to right arm
  let rightArmTransform = mat4(
    1, 0, 0, 0.25,
    0, Math.cos(rightArmRotation), -Math.sin(rightArmRotation), 0.1,
    0, Math.sin(rightArmRotation), Math.cos(rightArmRotation), 0,
    0, 0, 0, 1
  );
  rightArmNode.setTransform(rightArmTransform);

  // Update star scale
  starScale += starScaleDirection * 0.1;
  if (starScale > 1.5 || starScale < 0.4) {
    starScaleDirection *= -1; // Reverse scaling direction
  }

  // Apply scaling to star
  let starTransform = mat4(
    starScale, 0, 0, 0,
    0, starScale, 0, 0.4,
    0, 0, starScale, 0,
    0, 0, 0, 1
  );
  starNode.setTransform(starTransform);
}

function render() {
  //gl.clearColor(1.0, 0.6, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //updateMovements();

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
    { x: -0.31, z: 0.1, scaleX: 1, scaleZ: 5.8},
    { x: 0.3, z: -0.2, scaleX: 1, scaleZ: 5.8},
    { x: 0, z: 0.4, scaleX: 1, scaleZ: 2.8},
    { x: 0, z: -0.6, scaleX: 1, scaleZ: 2.8},
    { x: 0, z: -0.85, scaleX: 10, scaleZ: 0.5},
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

  // Create objects in the labyrinth
  let sphereMaterial = new MonochromeMaterial(gl, vec4(1, 0, 0, 1), shader);
  let cubeMaterial = new MonochromeMaterial(gl, vec4(0, 1, 0, 1), shader);
  let cylinderMaterial = new MonochromeMaterial(gl, vec4(0, 0, 1, 1), shader);
  let coneMaterial = new MonochromeMaterial(gl, vec4(1, 1, 0, 1), shader);
  let torusMaterial = new MonochromeMaterial(gl, vec4(1, 0, 1, 1), shader);

  let sphereMesh = new Sphere(0.1, gl, shader.getProgram());
  let cubeMesh = new Cuboid(0.2, 0.2, 0.2, gl, shader.getProgram());
  let cylinderMesh = new Cylinder(0.1, 0.2, gl, shader.getProgram());
  let coneMesh = new Cone(0.1, 0.2, gl, shader.getProgram());
  let torusMesh = new Torus(0.1, 0.05, gl, shader.getProgram());

  let sphereTransform = mat4(1, 0, 0, -0.5, 0, 1, 0, -1.8, 0, 0, 1, 0.2, 0, 0, 0, 1);
  let cubeTransform = mat4(1, 0, 0, 0.46, 0, 1, 0, -1.8, 0, 0, 1, -0.2, 0, 0, 0, 1);
  let cylinderTransform = mat4(1, 0, 0, -0.15, 0, 1, 0, -1.8, 0, 0, 1, -0.4, 0, 0, 0, 1);
  let coneTransform = mat4(1, 0, 0, 0.15, 0, 1, 0, -1.9, 0, 0, 1, 0.2, 0, 0, 0, 1);
  let torusTransform = mat4(1, 0, 0, 0.46, 0, 1, 0, -1.6, 0, 0, 1, -0.2, 0, 0, 0, 1);

  let sphereNode = new GraphicsNode(gl, sphereMesh, sphereMaterial, sphereTransform);
  let cubeNode = new GraphicsNode(gl, cubeMesh, cubeMaterial, cubeTransform);
  let cylinderNode = new GraphicsNode(gl, cylinderMesh, cylinderMaterial, cylinderTransform);
  let coneNode = new GraphicsNode(gl, coneMesh, coneMaterial, coneTransform);
  let torusNode = new GraphicsNode(gl, torusMesh, torusMaterial, torusTransform);

  rootNode.addChild(sphereNode);
  rootNode.addChild(cubeNode);
  rootNode.addChild(cylinderNode);
  rootNode.addChild(coneNode);
  rootNode.addChild(torusNode);

  // Create robot
  robotNode = new GraphicsNode(gl, null, null, mat4(1)); // Root node for the robot

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
  starNode = new GraphicsNode(gl, hatMesh, starMaterial, hatTransform);
  headNode.addChild(starNode);

  // Left Arm
  let leftArmTransform = mat4(1, 0, 0, -0.25, 0, 1, 0, 0.1, 0, 0, 1, 0, 0, 0, 0, 1);
  leftArmNode = new GraphicsNode(gl, limbMesh, limbMaterial, leftArmTransform);
  bodyNode.addChild(leftArmNode);

  // Right Arm
  let rightArmTransform = mat4(1, 0, 0, 0.25, 0, 1, 0, 0.1, 0, 0, 1, 0, 0, 0, 0, 1);
  rightArmNode = new GraphicsNode(gl, limbMesh, limbMaterial, rightArmTransform);
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

  //light

  let lightMaterial = new MonochromeMaterial(gl, vec4(1, 1, 1, 1), shader);
  let lightMesh = new Sphere(0.1, gl, shader.getProgram());
  let lightTransform = mat4(1, 0, 0, lightPositionX, 0, 1, 0, lightPositionY, 0, 0, 1, lightPositionZ, 0, 0, 0, 1);
  let lightNode = new GraphicsNode(gl, lightMesh, lightMaterial, lightTransform);
  rootNode.addChild(lightNode);


  rootNode.addChild(robotNode); // Attach robot node to the root node

 
  // Set the root node's transform to place it in the scene
  rootNode.setTransform(mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));

  // Add the root node to the scene graph or render it directly
  sceneGraph.addNode(rootNode);
}

function createSimpleScene(){
  let rootNode = new GraphicsNode(gl, null, null, mat4(1)); // Root node with identity transform

  let wallMaterial = new MonochromeMaterial(gl, vec4(0.5, 0.5, 0.5, 1), shader); // Material for walls

  // Create chessboard floor

  let cubeSize = 0.2;
  let cubiodMesh = new Cuboid(cubeSize, cubeSize, cubeSize, gl, shader.getProgram());
  //let cubiodMesh = new Star(5, 1, 0.5, 0.5, gl, shader.getProgram());


  let transform = mat4(1, 0, 0, 0, 0, 1, 0, -1.3, 0, 0, 1, 0, 0, 0, 0, 1);

  let cube = new GraphicsNode(gl, cubiodMesh, wallMaterial, transform);

  rootNode.addChild(cube); 

  sceneGraph.addNode(rootNode);

}


window.onload = init;

//window.onload = createSimpleScene;
