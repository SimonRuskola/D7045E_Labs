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
        this.gl = gl;
        this.vertices = vertices;
        this.indices = indices;
        /*vertex array object handle, this.vertexArray gets the value of a WebGLVertexArrayObject
        representing a vertex array object (VAO) which points to vertex array data*/
        this.vertexArray = this.gl.createVertexArray();

        
        this.gl.bindVertexArray(this.vertexArray);

        /*vertex buffer handle*/
        this.vertexBuffer = this.gl.createBuffer();

        /*bind the vertex buffer*/
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

        /*send the array of vertices to the GPU*/
        //this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.vertices), this.gl.STATIC_DRAW);

        /*index buffer handle*/
        this.indexBuffer = this.gl.createBuffer();

        /*bind the index buffer, using ELEMENT_ARRAY_BUFFER to identify the array as an array of indices*/
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        /*send the array of indices to the GPU*/
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), this.gl.STATIC_DRAW);


        this.vPosition = this.gl.getAttribLocation(shaderProgram, "vPosition");
        this.gl.vertexAttribPointer(this.vPosition, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.vPosition);

    }

    getVertexArray() {
        return this.vertexArray;
    }

    getVertices() {
        return this.vertices;
    }

    getIndices() {
        return this.indices;
    }
}
