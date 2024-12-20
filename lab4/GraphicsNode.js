/* Implement a graphics node class GraphicsNode that holds a mesh, a material, and
an instance specific transform (a model matrix) that it gets as parameters to its
constructor.
● The class should have a method draw that binds the mesh's vertex array object, calls
the ApplyMaterial method of the material, and then executes a draw call.
● There should also be a method update that can change the position and orientation
of the graphics node. The method gets the change in the form of a transform (4x4
matrix) and changes its internal model matrix by multiplying them.  */

class GraphicsNode {
  constructor(gl, mesh, material, transform) {
    this.gl = gl;
    this.material = material;
    this.mesh = mesh;
    this.transform = transform;
    this.children = [];
  }

  draw(parentTransform = mat4(1)) {
    // Combine the parent transform with the node's transform
    let combinedTransform = mult(parentTransform, this.transform);

    if (this.material != null) {
      gl.bindVertexArray(this.mesh.getVertexArray());
      this.material.applyMaterial(combinedTransform);
      this.gl.drawElements(
        this.gl.TRIANGLES,
        this.mesh.getIndices().length,
        this.gl.UNSIGNED_BYTE,
        0
      );
    }

    gl.bindVertexArray(null);

    for (let child of this.children) {
      child.draw(combinedTransform);
    }
  }

  addChild(node) {
    this.children.push(node);
  }

  setTransform(transform) {
    this.transform = transform;
  }
}



  