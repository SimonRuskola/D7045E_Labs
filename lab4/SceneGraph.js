
class SceneGraph {
    constructor() {
      this.root = null;
    }
  
    setRoot(node) {
      this.root = node;
    }
  
    addNode(node) {
      if (!this.root) {
        this.setRoot(node);
      } else {
        this.root.addChild(node);
      }
    }
  
    draw() {
      if (this.root) {
        this.root.draw();
      }
    }
}
  
