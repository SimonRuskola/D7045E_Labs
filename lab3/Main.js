
var canvas;
var gl;
var cubes = [];
var movingCubiod;
var movingCubiodTransform = mat4(1,0,0,0, 0,1,0,0, 0,0,1,5, 0,0,0,1);
var camera;
var shader;


function init() {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");


  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor(1.0, 0.6, 0.2, 1.0);

  gl.enable(gl.DEPTH_TEST);

  var fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, "fragment-shader");
  var vertexShader = new Shader(gl, gl.VERTEX_SHADER, "vertex-shader");
  shader = new ShaderProgram(gl, vertexShader.getShader(), fragmentShader.getShader());

  camera = new Camera(gl, shader.getProgram());

  var cubeColor = new MonochromeMaterial(gl, vec4(0.5 , 0, 0.5, 1), shader);

  var movingCubeColor = new MonochromeMaterial(gl, vec4(1, 1, 1, 1), shader);
  
  var cubiodMesh = new Cuboid(0.5, 0.5, 0.5, gl, shader.getProgram());

  movingCubiod = new GraphicsNode(gl, cubiodMesh, cubeColor, movingCubiodTransform);

  var maxX = 15;
  var minX = -15;
  var maxY = 15;
  var minY = -15;
  var maxZ = 15;
  var minZ = -50
  for (var i = 0; i <= 500; i++) {
    var x = Math.floor(Math.random() * (maxX - minX)) + minX;
    var y = Math.floor(Math.random() * (maxY - minY)) + minY;
    var z = Math.floor(Math.random() * (maxZ - minZ)) + minZ;
    var transform = mat4(1,0,0,x, 0,1,0,y, 0,0,1,z, 0,0,0,1);

    var cube = new GraphicsNode(gl, cubiodMesh, movingCubeColor, transform);

    cubes.push(cube);
  }

  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  shader.activateShader();
  camera.activate();

  movingCubiod.draw();

  for(var i = 0; i < cubes.length; i++) {
    cubes[i].draw();
  }
}

window.addEventListener('keydown', function(event) {
    if(event.keyCode == 87) { 
        movingCubiodTransform = add(movingCubiodTransform, mat4(0,0,0,0, 0,0,0,0.1, 0,0,0,0, 0,0,0,0));
        movingCubiod.updateTransform(movingCubiodTransform);

    } else if(event.keyCode == 65) { 
      movingCubiodTransform = add(movingCubiodTransform, mat4(0,0,0,-0.1, 0,0,0,0, 0,0,0,0, 0,0,0,0));
      movingCubiod.updateTransform(movingCubiodTransform);

    } else if(event.keyCode == 83) { 
      movingCubiodTransform = add(movingCubiodTransform, mat4(0,0,0,0, 0,0,0,-0.1, 0,0,0,0, 0,0,0,0));
      movingCubiod.updateTransform(movingCubiodTransform);

    } else if(event.keyCode == 68) {
      movingCubiodTransform = add(movingCubiodTransform, mat4(0,0,0,0.1, 0,0,0,0, 0,0,0,0, 0,0,0,0));
      movingCubiod.updateTransform(movingCubiodTransform);

    } else if(event.keyCode == 69) { 
      movingCubiodTransform = add(movingCubiodTransform, mat4(0,0,0,0, 0,0,0,0, 0,0,0,-0.1, 0,0,0,0));
      movingCubiod.updateTransform(movingCubiodTransform);
      
    } else if(event.keyCode == 81) { 
      movingCubiodTransform = add(movingCubiodTransform, mat4(0,0,0,0, 0,0,0,0, 0,0,0,0.1, 0,0,0,0));
      movingCubiod.updateTransform(movingCubiodTransform);
    }

    render();
});

window.onload = init;
