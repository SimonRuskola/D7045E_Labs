let gl;   // The webgl context.
let camera;

let a_coords_loc;       // Location of the a_coords attribute variable in the shader program.
let a_coords_buffer;    // Buffer to hold the values for a_coords.
let a_normal_loc;       // Location of a_normal attribute.
let a_normal_buffer;    // Buffer for a_normal.
let index_buffer;       // Buffer to hold vetex indices from model.

let u_diffuseColor;     // Locations of uniform variables in the shader program
let u_specularColor;
let u_specularExponent;
let u_lightPosition;
let u_modelview;
let u_projection;
let u_normalMatrix;    

const projection = mat4.create();    // projection matrix
let modelview;                       // modelview matrix; value comes from camera
const normalMatrix = mat3.create();  // matrix, derived from modelview matrix, for transforming normal vectors

const colors = [  // RGB color arrays for diffuse and specular color values, selected by popup menu
    [1,1,1], [1,0,0], [0,1,0], [0,0,1], [0,1,1], [1,0,1], [1,1,0], [0,0,0], [0.5,0.5,0.5]
];

const lightPositions = [  // values for light position, selected by popup menu
    [0,0,0,1], [0,0,1,0], [0,1,0,0], [0,0,-10,1], [2,3,5,0]
];

const objects = [  // Objects for display, selected by popup menu
    cube(5),
    uvTorus(3,1,64,32),
    uvCylinder(1.5,5.5),
    uvCone(2.5,5.5),
    uvSphere(3),
    uvSphere(3,12,6)
];

let currentModelNumber;  // contains data for the current object

function draw() { 
    gl.clearColor(0.15,0.15,0.3,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    mat4.perspective(projection,Math.PI/5,1,10,20);
    
    modelview = camera.getViewMatrix();
    
    if (currentModelNumber > 1) {
        mat4.rotateX(modelview,modelview,-Math.PI/2);
    }
    
    /* Get the matrix for transforming normal vectors from the modelview matrix,
       and send matrices to the shader program*/
    
    mat3.normalFromMat4(normalMatrix, modelview);
    
    gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);
    gl.uniformMatrix4fv(u_modelview, false, modelview );
    gl.uniformMatrix4fv(u_projection, false, projection );
    
    /* Draw the model.  The data for the model was set up in installModel() */
    //console.log(objects[currentModelNumber].indices);
    //console.log(objects[currentModelNumber].vertexPositions);
    //console.log(objects[currentModelNumber].vertexNormals);
    gl.drawElements(gl.TRIANGLES, objects[currentModelNumber].indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(draw);
}

/* Called when the user changes the selection in the model-selection pop-up.
 * The data for the model are copied into the appropriate buffers.
 */
function installModel(modelData) {
     gl.bindBuffer(gl.ARRAY_BUFFER, a_coords_buffer);
     gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
     gl.vertexAttribPointer(a_coords_loc, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(a_coords_loc);
     gl.bindBuffer(gl.ARRAY_BUFFER, a_normal_buffer);
     gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
     gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(a_normal_loc);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index_buffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
}

/* Initialize the WebGL context.  Called from init() */
function initGL() {
    let fragmentShader = new Shader(gl, gl.FRAGMENT_SHADER, "fragment-shader");
    let vertexShader = new Shader(gl, gl.VERTEX_SHADER, "vertex-shader");
    shaderProg = new ShaderProgram(gl, vertexShader.getShader(), fragmentShader.getShader());
    
    // Activate the shader program before setting uniforms
    //shaderProg.activateShader();

    let prog = shaderProg.getProgram();

    gl.useProgram(prog);
    a_coords_loc =  gl.getAttribLocation(prog, "a_coords");
    a_normal_loc =  gl.getAttribLocation(prog, "a_normal");
    u_modelview = gl.getUniformLocation(prog, "modelview");
    u_projection = gl.getUniformLocation(prog, "projection");
    u_normalMatrix =  gl.getUniformLocation(prog, "normalMatrix");
    u_lightPosition=  gl.getUniformLocation(prog, "lightPosition");
    u_diffuseColor =  gl.getUniformLocation(prog, "diffuseColor");
    u_specularColor =  gl.getUniformLocation(prog, "specularColor");
    u_specularExponent = gl.getUniformLocation(prog, "specularExponent");
    a_coords_buffer = gl.createBuffer();
    a_normal_buffer = gl.createBuffer();
    index_buffer = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST);
    gl.uniform3f(u_specularColor, 0.5, 0.5, 0.5);
    gl.uniform4f(u_diffuseColor, 1, 1, 1, 1);
    gl.uniform1f(u_specularExponent, 10);
    gl.uniform4f(u_lightPosition, 0, 0, 0, 1);
}

/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if ( ! gl ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e.message + "</p>";
        return;
    }
    document.getElementById("object").value = "1";
    document.getElementById("light").value = "0";
    document.getElementById("diffuse").value = "0";
    document.getElementById("specular").value = "8";
    document.getElementById("exponent").value = "10";
    document.getElementById("object").onchange = function() {
        let val = Number(this.value);
        currentModelNumber = val;
        installModel(objects[val]); 
        draw();
    };
    document.getElementById("light").onchange = function() {
        let val = Number(this.value);
        gl.uniform4fv(u_lightPosition, lightPositions[val]);
        draw();
    };
    document.getElementById("diffuse").onchange = function() {
        let val = Number(this.value);
        let c = colors[val];
        gl.uniform4f(u_diffuseColor, c[0], c[1], c[2], 1);
        draw();
        console.log("Diffuse: " + c);
    };
    document.getElementById("specular").onchange = function() {
        let val = Number(this.value);
        gl.uniform3fv(u_specularColor, colors[val]);
        draw();
        console.log("Specular: " + colors[val]);
    };
    document.getElementById("exponent").onchange = function() {
        let val = Number(this.value);
        gl.uniform1f(u_specularExponent, val);
        draw();
    };
    document.getElementById("reset").onclick = function() {
        camera.setView(15);
        draw();
    };
    installModel(objects[1]);
    currentModelNumber = 0;
    camera = new Camera(canvas, draw, 15,);
    draw();
}

window.onload = init;