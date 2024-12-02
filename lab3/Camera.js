/* class Camera for a simple camera (or
    “eye”). An instance of this camera is stationary in the world, meaning that once it has been
    created and given a location and orientation it can not be moved.
    The camera should define a view matrix and a perspective matrix, in terms of its parameters.
    The view/projection is then to be used on all graphics nodes when they are rendered.
    
 */

class Camera{
    constructor(location, oriantation){
        this.position = location;
        this.oriantation = oriantation;
    }
}