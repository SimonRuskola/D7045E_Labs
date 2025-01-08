/**
 * An object of type Camera can be used to implement camera movement and tilting
 * using keyboard inputs in a WebGL scene. Only the first parameter to the constructor is required.
 * When an object is created, keyboard event handlers are set up to respond to movement and tilting.
 * 
 * The class defines the following methods for an object camera of type Camera:
 *
 *    camera.getViewMatrix() returns the view transformation matrix as a regular JavaScript
 *         array of 16 elements, in column-major order, suitable for use with gl.uniformMatrix4fv
 *         or for further transformation with the glMatrix library mat4 class.
 *    camera.setView(viewDistance, viewpointDirection, viewUp) set up the view, where the
 *         parameters are optional and are used in the same way as the corresponding parameters
 *         in the constructor.
 *    camera.setViewDistance(viewDistance) sets the distance of the viewer from the origin without
 *         changing the direction of view. The parameter must be a positive number.
 *    camera.getViewDistance() returns the current value.
 *    camera.setRotationCenter( vector ) -- Sets the center of rotation.
 *       The parameter must be an array of (at least) three numbers.  The
 *       view is rotated about this point.  Usually, you want the rotation
 *       center to be the point that appears at the middle of the canvas,
 *       but that is not a requirement.  The initial value is effectively
 *       equal to [0,0,0].
 *    camera.getRotationCenter() -- returns the current value.
 *
 * @param canvas the HTML canvas element used for WebGL drawing.  The user will move and tilt the
 *    scene using keyboard inputs.  This parameter is required.
 * @param callback if present must be a function, which is called whenever the view changes.
 *    It is typically the function that draws the scene
 * @param viewDistance if present must be a positive number.  Gives the distance of the viewer
 *    from the origin.  If not present, the length is zero, which can be OK for orthographic projection,
 *    but never for perspective projection.
 * @param viewpointDirection if present must be an array of three numbers, not all zero.  The
 *    view is from the direction of this vector towards the origin (0,0,0).  If not present,
 *    the value [0,0,10] is used.  This is just the initial value for viewpointDirection; it will
 *    be modified by movement and tilting.
 * @param viewUp if present must be an array of three numbers. Gives a vector that will
 *    be seen as pointing upwards in the view.  If not present, the value is [0,1,0].
 *    Cannot be a multiple of viewpointDirection.  This is just the initial value for
 *    viewUp; it will be modified by movement and tilting.
 */
function Camera(canvas, callback, viewDistance, viewpointDirection, viewUp) {
    var unitx = new Array(3);
    var unity = new Array(3);
    var unitz = new Array(3);
    var viewZ;  // view distance; z-coord in eye coordinates;
    var center; // center of view; rotation is about this point; default is [0,0,0] 
    this.setView = function( viewDistance, viewpointDirection, viewUp ) {
        unitz = (viewpointDirection === undefined)? [0,0,10] : viewpointDirection;
        viewUp = (viewUp === undefined)? [0,1,0] : viewUp;
        viewZ = viewDistance;
        normalize(unitz, unitz);
        copy(unity,unitz);
        scale(unity, unity, dot(unitz,viewUp));
        subtract(unity,viewUp,unity);
        normalize(unity,unity);
        cross(unitx,unity,unitz);
    };
    this.getViewMatrix = function() {
        var mat = [ unitx[0], unity[0], unitz[0], 0,
                unitx[1], unity[1], unitz[1], 0, 
                unitx[2], unity[2], unitz[2], 0,
                0, 0, 0, 1 ];
        if (center !== undefined) {  // multiply on left by translation by rotationCenter, on right by translation by -rotationCenter
            var t0 = center[0] - mat[0]*center[0] - mat[4]*center[1] - mat[8]*center[2];
            var t1 = center[1] - mat[1]*center[0] - mat[5]*center[1] - mat[9]*center[2];
            var t2 = center[2] - mat[2]*center[0] - mat[6]*center[1] - mat[10]*center[2];
            mat[12] = t0;
            mat[13] = t1;
            mat[14] = t2;
        }
        if (viewZ !== undefined) {
            mat[14] -= viewZ;
        }
        return mat;
    };
    this.getViewDistance = function() {
        return viewZ;
    };
    this.setViewDistance = function(viewDistance) {
        viewZ = viewDistance;
    };
    this.getRotationCenter = function() {
        return (center === undefined) ? [0,0,0] : center;
    };
    this.setRotationCenter = function(rotationCenter) {
        center = rotationCenter;
    };
    this.setView(viewDistance, viewpointDirection, viewUp);
    document.addEventListener("keydown", doKeyDown, false);
    function applyTransvection(e1, e2) {  // rotate vector e1 onto e2
        function reflectInAxis(axis, source, destination) {
            var s = 2 * (axis[0] * source[0] + axis[1] * source[1] + axis[2] * source[2]);
            destination[0] = s*axis[0] - source[0];
            destination[1] = s*axis[1] - source[1];
            destination[2] = s*axis[2] - source[2];
        }
        normalize(e1,e1);
        normalize(e2,e2);
        var e = [0,0,0];
        add(e,e1,e2);
        normalize(e,e);
        var temp = [0,0,0];
        reflectInAxis(e,unitz,temp);
        reflectInAxis(e1,temp,unitz);
        reflectInAxis(e,unitx,temp);
        reflectInAxis(e1,temp,unitx);
        reflectInAxis(e,unity,temp);
        reflectInAxis(e1,temp,unity);
    }
    var centerX, centerY, radius2;
    var prevx,prevy;
    var moving = false;
    function doKeyDown(evt) {
        var key = evt.key;
        switch(key) {
            case "ArrowUp":
                moveForward();
                break;
            case "ArrowDown":
                moveBackward();
                break;
            case "ArrowLeft":
                tiltLeft();
                break;
            case "ArrowRight":
                tiltRight();
                break;
        }
        if (callback) {
            callback();
        }
    }
    function moveForward() {
        viewZ -= 1;
    }
    function moveBackward() {
        viewZ += 1;
    }
    function tiltLeft() {
        var angle = Math.PI / 180;
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var newx = cos * unitx[0] - sin * unitx[2];
        var newz = sin * unitx[0] + cos * unitx[2];
        unitx[0] = newx;
        unitx[2] = newz;
    }
    function tiltRight() {
        var angle = -Math.PI / 180;
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var newx = cos * unitx[0] - sin * unitx[2];
        var newz = sin * unitx[0] + cos * unitx[2];
        unitx[0] = newx;
        unitx[2] = newz;
    }
    function dot(v,w) {
        return v[0]*w[0] + v[1]*w[1] + v[2]*w[2];
    }
    function length(v) {
        return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    }
    function normalize(v,w) {
        var d = length(w);
        v[0] = w[0]/d;
        v[1] = w[1]/d;
        v[2] = w[2]/d;
    }
    function copy(v,w) {
        v[0] = w[0];
        v[1] = w[1];
        v[2] = w[2];
    }
    function add(sum,v,w) {
        sum[0] = v[0] + w[0];
        sum[1] = v[1] + w[1];
        sum[2] = v[2] + w[2];
    }
    function subtract(dif,v,w) {
        dif[0] = v[0] - w[0];
        dif[1] = v[1] - w[1];
        dif[2] = v[2] - w[2];
    }
    function scale(ans,v,num) {
        ans[0] = v[0] * num;
        ans[1] = v[1] * num;
        ans[2] = v[2] * num;
    }
    function cross(c,v,w) {
        var x = v[1]*w[2] - v[2]*w[1];
        var y = v[2]*w[0] - v[0]*w[2];
        var z = v[0]*w[1] - v[1]*w[0];
        c[0] = x;
        c[1] = y;
        c[2] = z;
    }
}

