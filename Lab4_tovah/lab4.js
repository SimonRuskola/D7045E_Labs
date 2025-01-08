// Tovah Parnes - tovpar-9@student.ltu.se

let canvas;
let gl;
let camera;
let shader;
let rootnode;

let objects = [];
const numObjects = 30;
const minSize = 0.3;
const maxSize = 1.5;

function createScene() {
	rootNode = new GraphicsNode(gl, null, null, mat4(1)); // Root node with identity transform

	let whiteMaterial = new MonoMaterial(gl, shader, vec4(1, 1, 1, 1));
	let blackMaterial = new MonoMaterial(gl, shader, vec4(0, 0, 0, 1));
	let wallMaterial = new MonoMaterial(gl, shader, vec4(0.5, 0.5, 0.5, 1)); // Material for walls

	// Create chessboard floor
	let floorSize = 8;
	let cubeSize = 0.2;
	let spacing = 0.001; // Add spacing between cubes
	let chessboardNode = new GraphicsNode(gl, null, null, mat4(1)); // Parent node for the chessboard
	let cubiodMesh = new Cuboid(gl, cubeSize, cubeSize, cubeSize,  shader);

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
	let wallMesh = new Cuboid(gl, wallThickness, wallHeight, cubeSize,  shader);

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
	let sphereMaterial = new MonoMaterial(gl, shader, vec4(1, 0, 0, 1));
	let cubeMaterial = new MonoMaterial(gl, shader, vec4(0, 1, 0, 1));
	let cylinderMaterial = new MonoMaterial(gl, shader, vec4(0, 0, 1, 1));
	let coneMaterial = new MonoMaterial(gl, shader, vec4(1, 1, 0, 1));
	let torusMaterial = new MonoMaterial(gl, shader, vec4(1, 0, 1, 1));
	

	let sphereMesh = new Sphere(gl, 0.1, 11, 11,  shader);
	let cubeMesh = new Cuboid(gl, 0.2, 0.2, 0.2, shader);
	let cylinderMesh = new Cylinder(gl,  0.1, 0.2, 10, shader);
	let coneMesh = new Cone(gl, 0.1, 0.2, 10, shader);
	let torusMesh = new Torus(gl, 0.05, 0.1, 3,  shader);
	

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

	let bodyMaterial = new MonoMaterial(gl, shader, vec4(0.8, 0.2, 0.2, 1));
	let limbMaterial = new MonoMaterial(gl, shader, vec4(0.2, 0.2, 0.8, 1));
	let handMaterial = new MonoMaterial(gl, shader, vec4(0.2, 0.8, 0.2, 1));
	let footMaterial = new MonoMaterial(gl, shader, vec4(0.8, 0.8, 0.2, 1));
	let starMaterial = new MonoMaterial(gl, shader, vec4(0.8, 0.8, 0.2, 1));

	let bodyMesh = new Cuboid(gl, 0.4, 0.6, 0.2,  shader);
	let limbMesh = new Cuboid(gl, 0.1, 0.4, 0.1,  shader);
	let handMesh = new Sphere(gl, 0.1, 11, 11,  shader);
	let footMesh = new Cone(gl, 0.1, 0.1, 10, shader);
	let headMesh = new Cuboid(gl, 0.3, 0.3, 0.3,  shader);
	let hatMesh = new Star(gl, 5, 0.3, 0.2, 0.1,  shader);

	//constructor(gl, points, outerDist, innerDist, thickness, shaderProgram)

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


	rootNode.addChild(robotNode); // Attach robot node to the root node

	// Set the root node's transform to place it in the scene
	rootNode.setTransform(mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));

}

function init() {
	// Canvas
	let canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		throw "Browser does not support WebGL";
	}

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.8, 0.8, 0.8, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// Shaders
	const vertexShader = new Shader(gl, gl.VERTEX_SHADER, "vertex-shader");
	const fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, "fragment-shader");
	shader = new ShaderProgram(gl, vertexShader, fragmentShader);
	shader.activate(); //TEST

	// Lights


	let ambientColor = vec4(0.6, 0.6, 0.6, 1.0);
	let diffuseColor = vec4(0.8, 0.8, 0.8, 1.0);
	let specularColor = vec3(1.0, 1.0, 1.0);
	let lightPosition = vec4(0.0, 10, 0.0, 1.0);
	let specularExponent = 500.0;

	let ambientColorLoc = gl.getUniformLocation(
		shader.getProgram(),
		"u_ambientColor"
	);
	gl.uniform4fv(ambientColorLoc, flatten(ambientColor));

	let diffuseColorLoc = gl.getUniformLocation(
		shader.getProgram(),
		"u_diffuseColor"
	);
	gl.uniform4fv(diffuseColorLoc, flatten(diffuseColor));

	let specularColorLoc = gl.getUniformLocation(
		shader.getProgram(),
		"u_specularColor"
	);
	gl.uniform3fv(specularColorLoc, flatten(specularColor));

	let lightPositionLoc = gl.getUniformLocation(
		shader.getProgram(),
		"u_lightPosition"
	);
	gl.uniform4fv(lightPositionLoc, flatten(lightPosition));

	let specularExponentLoc = gl.getUniformLocation(
		shader.getProgram(),
		"u_specularExponent"
	);
	gl.uniform1f(specularExponentLoc, specularExponent);

	// Camera
	camera = new Camera(gl, shader, canvas);

	// ColorMaterials
	let greenMaterial = new MonoMaterial(gl, shader, vec4(0, 1, 0, 1.0));
	let redMaterial = new MonoMaterial(gl, shader, vec4(1, 0, 0, 1.0));

	// Shapes
	let shape = new Cuboid(gl, 0.8, 0.5, 0.5, shader);
	//let shape = new Sphere(gl, 0.5, 16, 8, shader);
	//let shape = new Star(gl, 5, 0.8, 0.5, 0.3, shader);
	//let shape = new Torus(gl, 0.25, 0.5, 15, shader);
	//let shape = new Cone(gl, 0.5, 2.2, 16, shader);
	//let shape = new Cylinder(gl, 0.5, 1, 16, shader);

	/* let playerMatrix = mat4(
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	);  */

	let box1Matrix = mat4(1, 0, 0, -0, 0, 1, 0, 3, 0, 0, 1, -0, 0, 0, 0, 1)

	let box2Matrix = mat4(1, 0, 0, -0, 0, 1, 0, -3, 0, 0, 1, -0, 0, 0, 0, 1)

	createScene();
	
	box = new GraphicsNode(gl, shape, redMaterial, box1Matrix);
	box2 = new GraphicsNode(gl, shape, redMaterial, box2Matrix);
	objects.push(box);
	objects.push(box2);


	render();
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	shader.activate();
	camera.activate();
	
	rootNode.draw();

	 for (let object of objects) {
		object.draw();
	}



	requestAnimationFrame(render);
}

window.onload = init;
