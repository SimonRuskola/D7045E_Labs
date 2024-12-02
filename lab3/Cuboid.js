/* Implement a class Cuboid that extends Mesh and represents a cuboid.
● When a cuboid is created, it is only needed to give width, depth, and height, that is
the total extensions in the x, y, and z directions respectively. The midpoint of the
cuboid should be at the origin in the local coordinate system */

class Cuboid extends Mesh {
    constructor(gl, width, height, depth, shaderProgram, vertices, indices) {
        super(gl, vertices, indices, shaderProgram);
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.vertices = [];
        this.colors = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        this.setupCuboid();
        this.initBuffers();
    }

    
}