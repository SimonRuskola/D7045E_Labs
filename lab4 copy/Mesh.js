/* ● Implement a class Mesh for meshes intended to be used when defining surfaces of
graphical objects.
● Apart from a graphics context, the constructor should take arrays with vertex and
index data describing the mesh, and create (via WebGL/OpenGL calls)
○ a Vertex Array Object handle,
○ a Vertex Buffer handle, and
○ an Element Array Buffer handle (index buffer).
● It also sets up vertex attribute pointers accordingly. */

class Mesh {
    constructor(gl, vertices, indices, normals, shaderProgram) {
        this.vertices = vertices;
        this.indices = indices;
        this.normals = normals;
        this.gl = gl;

        //console.log(this.normals);

       /*  // Create and bind the Vertex Array Object
        this.vertexArray = gl.createVertexArray();
        gl.bindVertexArray(this.vertexArray);

        // Create and bind the Vertex Buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        // Create and bind the Normal Buffer
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

        // Create and bind the Element Array Buffer (index buffer)
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), gl.STATIC_DRAW);

        
        let a_coords = gl.getAttribLocation(shaderProgram, "a_coords");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_coords, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_coords);
        
        
        let aNormal = gl.getAttribLocation(shaderProgram, "a_normal");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(aNormal, 4, gl.FLOAT, false, 0, 0); 
        gl.enableVertexAttribArray(aNormal);

        // Unbind the Vertex Array Object to prevent accidental modification
        gl.bindVertexArray(null); */


        
        this.vertexArray = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vertexArray);
        
        var a_coords = this.gl.getAttribLocation(shaderProgram, "a_coords");
        var vNormal = this.gl.getAttribLocation(shaderProgram, "a_normal" );

        this.nBuffer = this.gl.createBuffer();
        this.vertexBuffer = this.gl.createBuffer();
        this.indexBuffer = gl.createBuffer();


        this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), gl.STATIC_DRAW);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.vertices), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(a_coords, 4, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray(a_coords);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.normals), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(vNormal, 4, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray(vNormal);
        
        

        
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