/* Implement a graphics node class GraphicsNode that holds a mesh, a material, and
an instance specific transform (a model matrix) that it gets as parameters to its
constructor.
● The class should have a method draw that binds the mesh's vertex array object, calls
the ApplyMaterial method of the material, and then executes a draw call.
● There should also be a method update that can change the position and orientation
of the graphics node. The method gets the change in the form of a transform (4x4
matrix) and changes its internal model matrix by multiplying them.  */

class GraphicsNode {
    /*holds a mesh resource, material and an instance specific transform*/
    constructor(gl, mesh, material, transform) {
        this.gl = gl;
        this.mesh = mesh;
        this.material = material;
        this.transform = transform;
    }
  
    draw() {
        /*bind the mesh's vertex array object*/
        //this.gl.bindVertexArray(this.mesh.getVertexArray());
    
        /*call the apply material method of the material*/
        this.material.applyMaterial(this.transform);
    
        /*execute a draw call*/
        this.gl.drawElements(this.gl.TRIANGLES, this.mesh.getIndices().length, this.gl.UNSIGNED_BYTE, 0);
    }
  
    //if you move a node around the transform needs to be updated
    updateTransform(transform) {
        this.transform = transform;
    }
  
  }