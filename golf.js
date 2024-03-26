var canvas;
var gl;
var program;

var NumVertices = 18;
var numTextures = 2;

var pointsArray = [];
var texCoordsArray = [];
var texture = [];
var images = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var x = 0;
var y = 0;
var z = 0;

// Golf ball
var numTimesToSubDivide = 3;
var ballX = -2;
var ballY = -2.3;
var ballZ = -3;
// For resetting ball position
var originalBallX = ballX;
var originalBallY = ballY;
var originalBallZ = ballZ; 
var ballShadow = true; // Whether to render shadow


var axis = 0;
var theta = [0, 0, 0];

var thetaLoc;
var projection;

// Set up texture coordinates
var texCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0)];

// Cube vertices
var vertices = [
    vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, -0.5, -0.5),
];

// Pyramid vertices
var pVertices = [
    vec3(0, 0, 0.5),
    vec3(-0.5, 0, 0),
    vec3(0, 0, -0.5),
    vec3(0.5, 0, 0),
    vec3(0, 0.5, 0),
];


// Shadow variables
var light = vec3(-6, 4, -7); // light source
var m = mat4(); // projection matrix
var shadowColors = [];
var gray = vec4(0.3, 0.3, 0.3, 1.0);

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
    alert("WebGL isn't available");
    }

    // Set position of light source
    m[3][3] = 0;
    m[3][1] = -1 / light[1];

    textureCube();

    // Set up blade vertices
    texture_quad(1, 2, 3, 0);

    // Normalize vertices
    for (var i = 0; i < vertices.length; i++) {
        var x = vertices[i][0];
        var y = vertices[i][1];
        var z = vertices[i][2];
        vertices[i] = vec3(x * (0.5 / Math.sqrt(x * x + z * z)), y, z * (0.5 / Math.sqrt(x * x + z * z)));
    }

    // Set up cube vertices
    texture_quad(1, 0, 3, 2);
    texture_quad(2, 3, 7, 6);
    texture_quad(4, 5, 6, 7);
    texture_quad(5, 4, 0, 1);

    // Set up pyramid vertices

    // Base of pyramid
    texture_triangle(0, 1, 2, 3);
    // 4 sides of pyramid
    triangle(0, 1, 4);
    triangle(1, 2, 4);
    triangle(2, 3, 4);
    triangle(3, 0, 4);

    sphere();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    // Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Initialize textures
    initializeTexture(images, "grass.jpg", 0);
    initializeTexture(images, "sky.png", 1);
    initializeTexture(images, "wood.jpg", 2);
    initializeTexture(images, "textile.jpg", 3);
    initializeTexture(images, "black.jpg", 4);
    initializeTexture(images, "red.png", 5);
    initializeTexture(images, "texture.jpg", 6);
    initializeTexture(images, "golfball.jpg", 7); // golfball image

    thetaLoc = gl.getUniformLocation(program, "theta");

    modelView = gl.getUniformLocation(program, "modelView");

    // Access projection matrix
    projection = gl.getUniformLocation(program, "projection");

    // Event listeners for buttons

    document.getElementById("resetBall").onclick = function (e) {
        ballX = originalBallX;
        ballY = originalBallY;
        ballZ = originalBallZ;
        ballShadow = true;
    };

    

    document.addEventListener("keydown", keyResponse); // get keyboard input

    render();
};

function keyResponse(event) {
    var key = String.fromCharCode(event.keyCode);

    switch (key) {
        case "1":
            axis = xAxis;
            theta[axis] += 2.0;
            break;
        case "R":
            if(x < 7)
                x += 0.1;
            break;
        case "L":
            if(x > -7)
                x -= 0.1;
            break;
        case "F":
            if(z < 7)
                z += 0.1;
            break;
        case "B":
            if(z > 0)
                z -= 0.1;
    }

    // Golf ball controls
    switch (event.key) {
        case "ArrowUp":
            ballZ -= 0.1;
            break;
        case "ArrowDown":
            ballZ += 0.1;
            break;
        case "ArrowRight":
            ballX += 0.1;
            break;
        case "ArrowLeft":
            ballX -= 0.1;
            break;
    }
}

function textureCube() {
    //quad( 1, 0, 3, 2 );
    texture_quad(3, 0, 4, 7);
    texture_quad(2, 3, 7, 6);

    texture_quad(6, 5, 1, 2);
    texture_quad(4, 5, 6, 7);
    texture_quad(5, 4, 0, 1);
}

function texture_quad(a, b, c, d) {
    // Set uo vertices of quad and associated texture coordinates
    pointsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices[b]);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices[d]);
    texCoordsArray.push(texCoord[3]);
}

function texture_triangle(a, b, c, d) {
    // Set uo vertices of quad and associated texture coordinates
    pointsArray.push(pVertices[a]);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(pVertices[b]);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(pVertices[c]);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(pVertices[a]);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(pVertices[c]);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(pVertices[d]);
    texCoordsArray.push(texCoord[3]);
}

// Set up images as textures
function initializeTexture(image_arr, filename, id) {
    image_arr[id] = new Image();
    image_arr[id].onload = function () {
    configureTexture(image_arr[id], id);
    };
    image_arr[id].src = filename;
}

function configureTexture(image, id) {
    texture[id] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture[id]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

// Push vertices and colors for quadrilateral
function quad(a, b, c, d) {
    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; i++) {
        pointsArray.push(indices[i]);
    }
}

// Draw 4 rotating windmill blades
function windmill_blade() {
    gl.bindTexture(gl.TEXTURE_2D, texture[3]);

    var rotating_dist = Math.sqrt(Math.pow(0.2, 2) + Math.pow(0.2, 2)) / 2; // Distance from vertex of rotated square to origin
    angle = 90;
    theta[axis] += 1.0;

    for (var i = 0; i < 4; i++) {
        gl.bindTexture(gl.TEXTURE_2D, texture[3]);
        mvMatrix = mat4(); // Current transformation matrix
        mvMatrix = mult(mvMatrix, translate(x, y - 0.75, z - 4));
        mvMatrix = mult(mvMatrix, rotate(theta[axis], 0.0, 0.0, 1.0)); // Rotate clockwise
        mvMatrix = mult(mvMatrix, rotate(angle, 0.0, 0.0, 1.0)); // Rotate clockwise
        mvMatrix = mult(mvMatrix, translate(0.0, 3.3 * rotating_dist, 0.0));
        mvMatrix = mult(mvMatrix, scalem(0.9, 2.0, 1.0));
        mvMatrix = mult(mvMatrix, rotate(-45.0, 0.0, 0.0, 1.0));
        mvMatrix = mult(mvMatrix, scalem(0.4, 0.4, 0.4));

        gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));
        gl.drawArrays(gl.TRIANGLES, 20, 6);

        // Render shadow
        gl.bindTexture(gl.TEXTURE_2D, texture[4]);
        mvMatrix = mat4();
        mvMatrix = mult(mvMatrix, translate(light[0], light[1] / 2.6, light[2]));
        mvMatrix = mult(mvMatrix, m);
        mvMatrix = mult(mvMatrix, translate(-light[0], -light[1], -light[2]));

        mvMatrix = mult(mvMatrix, translate(x, y - 0.75, z - 4));
        mvMatrix = mult(mvMatrix, rotate(theta[axis], 0.0, 0.0, 1.0)); // Rotate clockwise
        mvMatrix = mult(mvMatrix, rotate(angle, 0.0, 0.0, 1.0)); // Rotate clockwise
        mvMatrix = mult(mvMatrix, translate(0.0, 3.3 * rotating_dist, 0.0));
        mvMatrix = mult(mvMatrix, scalem(0.9, 2.0, 1.0));
        mvMatrix = mult(mvMatrix, rotate(-45.0, 0.0, 0.0, 1.0));
        mvMatrix = mult(mvMatrix, scalem(0.4, 0.4, 0.4));

        gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

        gl.drawArrays(gl.TRIANGLES, 20, 6);

        angle -= 90;
    }
}

function cube() {
    gl.bindTexture(gl.TEXTURE_2D, texture[2]);
    var mvMatrix = mat4();
    mvMatrix = mult(mvMatrix, translate(x, y - 1.7, z - 5));
    mvMatrix = mult(mvMatrix, scalem(1.5, 1.5, 1.5));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 36, 24);

    // Render shadow
    gl.bindTexture(gl.TEXTURE_2D, texture[4]);
    mvMatrix = mat4();

    mvMatrix = mult(mvMatrix, translate(light[0], light[1] / 2.6, light[2]));
    mvMatrix = mult(mvMatrix, m);
    mvMatrix = mult(mvMatrix, translate(-light[0], -light[1], -light[2]));
    mvMatrix = mult(mvMatrix, translate(x, y - 1.7, z - 5));
    mvMatrix = mult(mvMatrix, scalem(1.5, 1.5, 1.5));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 36, 24);
}

function triangle(a, b, c) {
    pointsArray.push(pVertices[a]);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(pVertices[b]);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(pVertices[c]);
    texCoordsArray.push(texCoord[2]);
}

function sphereTriangle(a, b, c) {
    pointsArray.push(a);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(b);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(c);
    texCoordsArray.push(texCoord[2]);
}

function normalizeVec(vec) {
    var len = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]) / 10;
    
    return vec3(vec[0] / len, vec[1] / len, vec[2] / len);
}

function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        ab = normalizeVec(ab);
        ac = normalizeVec(ac);
        bc = normalizeVec(bc);
        
        divideTriangle(a, ab, ac, count-1);
        divideTriangle(c, ac, bc, count-1);
        divideTriangle(b, bc, ab, count-1);
        divideTriangle(ab, bc, ac, count-1);
    }

    else {
        sphereTriangle(a, b, c);
    }

}

function sphere() {
    var v0 = vec3(0.0, 10, 0.0);
    var v1 = vec3(0.0, 0.0, 10);
    var v2 = vec3(10, 0.0, 0.0);
    var v3 = vec3(0.0, 0.0, -10);
    var v4 = vec3(-10, 0.0, 0.0);
    var v5 = vec3(0.0, -10, 0.0);

    divideTriangle(v0, v1, v2, numTimesToSubDivide);
    divideTriangle(v0, v2, v3, numTimesToSubDivide);
    divideTriangle(v0, v3, v4, numTimesToSubDivide);
    divideTriangle(v0, v4, v1, numTimesToSubDivide);
    divideTriangle(v5, v1, v2, numTimesToSubDivide);
    divideTriangle(v5, v2, v3, numTimesToSubDivide);
    divideTriangle(v5, v3, v4, numTimesToSubDivide);
    divideTriangle(v5, v4, v1, numTimesToSubDivide);
} 

// Draw pyrmaid
function pyramid() {
    gl.bindTexture(gl.TEXTURE_2D, texture[2]);
    mvMatrix = mat4();
    mvMatrix = mult(mvMatrix, translate(x, y - 0.95, z - 5));
    mvMatrix = mult(mvMatrix, rotate(45, 0, 1.0, 0));
    mvMatrix = mult(mvMatrix, scalem(1.5, 1.5, 1.5));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 60, 18);

    gl.bindTexture(gl.TEXTURE_2D, texture[4]);
    mvMatrix = mat4();

    // Render shadow
    mvMatrix = mult(mvMatrix, translate(light[0], light[1] / 2.6, light[2]));
    mvMatrix = mult(mvMatrix, m);
    mvMatrix = mult(mvMatrix, translate(-light[0], -light[1], -light[2]));

    mvMatrix = mult(mvMatrix, translate(x, y - 0.95, z - 5));
    mvMatrix = mult(mvMatrix, rotate(45, 0, 1.0, 0));
    mvMatrix = mult(mvMatrix, scalem(1.5, 1.5, 1.5));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 60, 18);
}

// Draw 2nd pyramid 
function pyramid_2() {
    gl.bindTexture(gl.TEXTURE_2D, texture[6]);
    mvMatrix = mat4();
    mvMatrix = mult(mvMatrix, translate(x - 3, y - 3, z - 7));
    mvMatrix = mult(mvMatrix, rotate(15, 0, 1.0, 0));
    mvMatrix = mult(mvMatrix, scalem(3, 5, 2));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 60, 18);

    // Render shadow
    gl.bindTexture(gl.TEXTURE_2D, texture[4]);
    mvMatrix = mat4();

    mvMatrix = mult(mvMatrix, translate(light[0], light[1] / 2.6, light[2]));
    mvMatrix = mult(mvMatrix, m);
    mvMatrix = mult(mvMatrix, translate(-light[0], -light[1]/1.1, -light[2]));
    mvMatrix = mult(mvMatrix, translate(x - 3, y - 3, z - 7));
    mvMatrix = mult(mvMatrix, rotate(15, 0, 1.0, 0));
    mvMatrix = mult(mvMatrix, scalem(3, 5, 2));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 60, 18);
}

// Draw pyramid 3
function pyramid_3() {
    gl.bindTexture(gl.TEXTURE_2D, texture[6]);
    mvMatrix = mat4();
    mvMatrix = mult(mvMatrix, translate(x + 4, y - 3, z - 6));
    mvMatrix = mult(mvMatrix, rotate(15, 0, 1.0, 0));
    mvMatrix = mult(mvMatrix, scalem(4, 3, 2));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 60, 18);

    // Render shadow
    gl.bindTexture(gl.TEXTURE_2D, texture[4]);
    mvMatrix = mat4();

    mvMatrix = mult(mvMatrix, translate(light[0], light[1]/2.6, light[2]));
    mvMatrix = mult(mvMatrix, m);
    mvMatrix = mult(mvMatrix, translate(-light[0], -light[1]/1.07, -light[2]));
    mvMatrix = mult(mvMatrix, translate(x + 4, y - 3, z - 6));
    mvMatrix = mult(mvMatrix, rotate(15, 0, 1.0, 0));
    mvMatrix = mult(mvMatrix, scalem(3, 5, 2));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 60, 18);
}

function flag() {
    gl.bindTexture(gl.TEXTURE_2D, texture[5]);
    mvMatrix = mat4();
    mvMatrix = mult(mvMatrix, translate(x + 4, y + 0.1, z - 7));
    mvMatrix = mult(mvMatrix, scalem(1.5, 0.5, 1));
    mvMatrix = mult(mvMatrix, rotate(45, 0.0, 0.0, 1.0));
    mvMatrix = mult(mvMatrix, rotate(90, 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(90, 0.0, 0.0, 1.0));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Render shadow
    gl.bindTexture(gl.TEXTURE_2D, texture[4]);
    mvMatrix = mat4();

    mvMatrix = mult(mvMatrix, translate(light[0], light[1] / 2.6, light[2]));
    mvMatrix = mult(mvMatrix, m);
    mvMatrix = mult(mvMatrix, translate(-light[0], -light[1]/1.05, -light[2]));
    mvMatrix = mult(mvMatrix, translate(x + 4, y + 0.1, z - 7));
    mvMatrix = mult(mvMatrix, scalem(1.5, 0.5, 1));
    mvMatrix = mult(mvMatrix, rotate(45, 0.0, 0.0, 1.0));
    mvMatrix = mult(mvMatrix, rotate(90, 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(90, 0.0, 0.0, 1.0));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function line() {
    gl.bindTexture(gl.TEXTURE_2D, texture[5]);
    mvMatrix = mat4();
    mvMatrix = mult(mvMatrix, translate(x + 3, y - 1, z - 8));
    mvMatrix = mult(mvMatrix, scalem(2, 3, 1));
    mvMatrix = mult(mvMatrix, rotate(90, 0.0, 0.0, 1.0));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.LINES, 0, 2);

    // Render shadow
    gl.bindTexture(gl.TEXTURE_2D, texture[4]);
    mvMatrix = mat4();

    mvMatrix = mult(mvMatrix, translate(light[0], light[1] / 2.6, light[2]));
    mvMatrix = mult(mvMatrix, m);
    mvMatrix = mult(mvMatrix, translate(-light[0], -light[1], -light[2]));
    mvMatrix = mult(mvMatrix, translate(x + 3, y - 1, z - 8));
    mvMatrix = mult(mvMatrix, scalem(2, 3, 1));
    mvMatrix = mult(mvMatrix, rotate(90, 0.0, 0.0, 1.0));
    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.LINES, 0, 2);
}

function golfBall() {
    gl.bindTexture(gl.TEXTURE_2D, texture[7]);
    mvMatrix = mat4();
    mvMatrix = mult(mvMatrix, translate(x + ballX, ballY, z + ballZ));
    mvMatrix = mult(mvMatrix, scalem(0.015, 0.015, 0.015));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 78, 1536);

    // Render shadow
    if(ballShadow) {
        gl.bindTexture(gl.TEXTURE_2D, texture[4]);
        mvMatrix = mat4();
        mvMatrix = mult(mvMatrix, translate(light[0], light[1] / 2.6, light[2]));
        mvMatrix = mult(mvMatrix, m);
        mvMatrix = mult(mvMatrix, translate(-light[0], -light[1]/2.2, -light[2]));
        mvMatrix = mult(mvMatrix, translate(x + ballX, ballY, z + ballZ));
        mvMatrix = mult(mvMatrix, scalem(0.015, 0.015, 0.015));

        gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

        gl.drawArrays(gl.TRIANGLES, 78, 1536);

    }
}

function collisionCheck() {
    var ballPos = vec3(x+ ballX, y + ballY, z+ballZ);
    var holePos = vec3(4.0+x, -2.3, -7.49+z); // X and Z increment to account for different camera position
    var windmillPos = vec3(x, -2.3, -5+z);
    var pyramid2Pos = vec3(-3+x, -2.3, -7+z);
    var pyramid3Pos = vec3(4+x, -2.3, -6+z);
    var farPos = vec3(x, y, -10+z);
    var rightPos = vec3(10+x, y, z);
    var leftPos = vec3(-10+x, y, z);
    var backPos = vec3(x, y, 1+z);

    if (Math.abs(ballPos[0] - holePos[0]) <= 0.1 && Math.abs(ballPos[1] - holePos[1]) <= 0.1 && Math.abs(ballPos[2] - holePos[2]) <= 0.05) {
        ballY--;
        document.getElementById("PlayerMessage").innerHTML = "Hole in one! You win, reset the ball position to play again.";

        setTimeout(function () {
        document.getElementById("PlayerMessage").innerHTML = "";
        }, 4000); // display for 4 seconds

        ballShadow = false;
    }

    if (Math.abs(ballPos[0] - windmillPos[0]) <= 0.6 && Math.abs(ballPos[1] - windmillPos[1]) <= 0.1 && Math.abs(ballPos[2] - windmillPos[2]) <= 0.6) {
        ballY--;
        document.getElementById("PlayerMessage").innerHTML = "Collision! You lose, reset the ball to play again.";
        setTimeout(function () {
            document.getElementById("PlayerMessage").innerHTML = "";
            }, 4000); // display for 4 seconds
        ballShadow = false;
    }

    if (Math.abs(ballPos[0] - pyramid2Pos[0]) <= 1 && Math.abs(ballPos[1] - pyramid2Pos[1]) <= 0.1 && Math.abs(ballPos[2] - pyramid2Pos[2]) <= 1) {
        ballY--;
        document.getElementById("PlayerMessage").innerHTML = "Collision! You lose, reset the ball to play again.";
        setTimeout(function () {
            document.getElementById("PlayerMessage").innerHTML = "";
            }, 4000); // display for 4 seconds
        ballShadow = false;
    }

    if (Math.abs(ballPos[0] - pyramid3Pos[0]) <= 0.9 && Math.abs(ballPos[1] - pyramid3Pos[1]) <= 0.1 && Math.abs(ballPos[2] - pyramid3Pos[2]) <= 0.5) {
        ballY--;
        document.getElementById("PlayerMessage").innerHTML = "Collision! You lose, reset the ball to play again.";
        setTimeout(function () {
            document.getElementById("PlayerMessage").innerHTML = "";
            }, 4000); // display for 4 seconds
        ballShadow = false;
    }

    // Out of bounds check
    if (Math.abs(ballPos[2] - farPos[2]) <= 0.5 || Math.abs(ballPos[0] - rightPos[0]) <= 0.5 || Math.abs(ballPos[0] - leftPos[0]) <= 0.5 || Math.abs(ballPos[2] - backPos[2]) <= 0.5) {
        ballY--;
        document.getElementById("PlayerMessage").innerHTML = "Out of bounds! You lose, reset the ball to play again.";
        setTimeout(function () {
            document.getElementById("PlayerMessage").innerHTML = "";
            }, 4000); // display for 4 seconds
        ballShadow = false;
    }

}

function render() {

    document.getElementById("resetCamera").onclick = function (e) {
        x = 0;
        y = 0;
        z = 0;
    };
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pMatrix = perspective(90, 1.0, 1.0, 500.0);
    gl.uniformMatrix4fv(projection, false, flatten(pMatrix));

    gl.uniform3fv(thetaLoc, flatten(theta));

    mvMatrix = mat4();
    mvMatrix = mult(mvMatrix, translate(x, y, z - 4));
    mvMatrix = mult(mvMatrix, scalem(20, 5, 10));

    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));

    // Draw each image on one side of the cube

    gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindTexture(gl.TEXTURE_2D, texture[1]);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    gl.drawArrays(gl.TRIANGLES, 12, 6);
    gl.drawArrays(gl.TRIANGLES, 18, 6);
    gl.drawArrays(gl.TRIANGLES, 24, 6);

    windmill_blade();
    cube();
    pyramid();
    pyramid_2();
    pyramid_3();
    flag();
    line();
    golfBall();


    collisionCheck();
    
    
    requestAnimFrame(render);

};