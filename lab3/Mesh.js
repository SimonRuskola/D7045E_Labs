/* ● Implement a class Mesh for meshes intended to be used when defining surfaces of
graphical objects.
● Apart from a graphics context, the constructor should take arrays with vertex and
index data describing the mesh, and create (via WebGL/OpenGL calls)
○ a Vertex Array Object handle,
○ a Vertex Buffer handle, and
○ an Element Array Buffer handle (index buffer).
● It also sets up vertex attribute pointers accordingly. */

class Mesh {

    constructor(gl, vertices, indices, shaderProgram) {

        this.vertices = vertices;
        this.indices = indices;
  
       
        this.vertexArray = gl.createVertexArray();
        gl.bindVertexArray(this.vertexArray);

        this.vertexBuffer = gl.createBuffer();
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), gl.STATIC_DRAW);
    
        this.vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);
    }
  
    getVertices() {
        return this.vertices;
    }
    getIndices() {
        return this.indices;
    }
    getVertexArray() {
        return this.vertexArray;
    }
  
  
  }