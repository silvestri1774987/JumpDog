"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;




var instanceMatrix;

var modelViewMatrixLoc;

var flag = false;
var dir=true;

var legAngle=-100;
var torso_loc=-7;

var x_dir, y_dir, z_dir;
var distanceZ, distanceY;
var ang_1, ang_2;

var roll=0;
var pitch=0;

var texSize = 256;
var numChecks = 8;

var texture1, texture2;
var t1, t2;

var phi = -50.3;
var th = 120;
var dr = 5.0 * Math.PI/180.0;
var radius = 1.0;


var torso_Y = 6;

var c;


var image1 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchx = Math.floor(i/(texSize/numChecks));
            var patchy = Math.floor(j/(texSize/numChecks));
            if(patchx%2 ^ patchy%2) c = 255;
            else c = 0;
            image1[4*i*texSize+4*j] = c;
            image1[4*i*texSize+4*j+1] = c;
            image1[4*i*texSize+4*j+2] = c;
            image1[4*i*texSize+4*j+3] = 255;
        }
    }

var image2 = new Uint8Array(4*texSize*texSize);

    
    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            image2[4*i*texSize+4*j] = i-255;
            image2[4*i*texSize+4*j+1] = i-255;
            image2[4*i*texSize+4*j+2] = i-255;
            image2[4*i*texSize+4*j+3] = 255;
           }
    }

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];


var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


function configureTexture() {
    texture1 = gl.createTexture(); // create a texture object
    gl.bindTexture( gl.TEXTURE_2D, texture1 ); //bind the texture object as the current texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
   
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}



//-----------Texture 

var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

var tailId = 11; 
var neckId = 12;

var col1Id = 0;
var col2Id = 1;

var sbr1Id = 2;
var sbr2Id = 3;




var torsoWidth = 4.0/5;
var torsoHeight = 1.0/5;

var upperArmHeight = 1.25/5;
var lowerArmHeight = 1.25/5;
var upperArmWidth  = 0.5/5;
var lowerArmWidth  = 0.3/5;
var upperLegWidth  = 0.5/5;
var lowerLegWidth  = 0.3/5;

var lowerLegHeight = 1.25/5;
var upperLegHeight = 1.25/5;

var headHeight = 2.0/5;
var headWidth = 1.0/5;

var tailHeight = 2.0/5;
var tailWidth = 0.3/5;

var neckHeight = 2/5;
var neckWidth = 0.66/5;

var col1Width = 4.5/5;
var col1Height = 1.5/5;

var col2Width = 4.5/5;
var col2Height = 1.5/5;//col left

var sbr1Height = 20.0/5;//lunghezza
var sbr1Width = 0.3/5;//sbarra sopra

var sbr2Height = 20.0/5;
var sbr2Width = 0.3/5;


var numNodes = 13; 
var numNodesObs = 4;
var numAngles = 13; 



var theta = [270, -28, -100, 10, -100, 10, 259, 10, 259, 10, 0, 45, 58];
var thetaO = [0, 0, -0.79, -0.79];//20,45,45,45
var numVertices = 36;

var eye;
var at= vec3(0.0,0.0,0.0);
var up= vec3(0.0,1.0,0.0);

var stack = [];

var figure = [];
var obstacle = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);
for( i=0; i<numNodesObs; i++) obstacle[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;


//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodesObs(Id){
    var n = mat4();
    
    switch(Id) {

    case col1Id:

    n = translate(0, 5.5,-2);
    n = mult(n, rotate(thetaO[col1Id], 1, 0, 0));
    //n = mult(n, rotate(20, 0, 0, 1));
    obstacle[col1Id] = createNode( n, col1, null, null );
    break;

    case col2Id:

    n = translate(0,5.5,2);
    n = mult(n, rotate(thetaO[col2Id], 1, 0, 0));
    //n = mult(n, rotate(20, 0, 0, 1));
    obstacle[col2Id] = createNode( n, col2, null, null );
    break;

    case sbr1Id:

    n = translate(0, 6.2 ,-2); 
    n = mult(n, rotate(90, 1, 0, 0));
    n = mult(n, rotate(0, 0, 0, 1));
    n = mult(n, rotate(thetaO[sbr1Id], 0, 1, 0));
    obstacle[sbr1Id] = createNode( n, sbr1, null, null );
    break;

     case sbr2Id:

    n = translate(0, 6 ,-2); 
    n = mult(n, rotate(90, 1, 0, 0));
    n = mult(n, rotate(0, 0, 0, 1));
    n = mult(n, rotate(thetaO[sbr1Id], 0, 1, 0));
    obstacle[sbr2Id] = createNode( n, sbr2, null, null );
    break;
    

    }
}

function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    
    case torsoId:
    m = translate(torso_loc-2,torso_Y,0);
    m = mult(m, rotate(theta[torsoId], 0, 0, 1 ));
    m = mult(m, rotate(-90, 0, 1, 0 ));
    figure[torsoId] = createNode( m, torso, neckId, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:


    
    m = translate(0, torsoWidth+0.17, 0.5); 
    m = mult(m, rotate(theta[head1Id], 1, 0, 0))
	m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    m = mult(m, rotate(roll, 0,0,1));
  	m = mult(m, rotate(pitch, 1,0, 0));
    //---Animation Stuff
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;

    case neckId:
    m = translate(0, 0.77,0.05);
    m = mult(m, rotate(theta[neckId], 1, 0, 0));
    figure[neckId] = createNode(m, neck, null, null);
    break;



    case leftUpperArmId:

    
    m = translate(-torsoHeight/2.2, 0.95*torsoWidth , -0.1); 
    m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    
    m = translate(torsoHeight/2.2, 0.95*torsoWidth , -0.1);
    m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    
    m = translate(-(torsoHeight)/2.2, 0.1*torsoWidth, -0.1); 
	m = mult(m , rotate(theta[leftUpperLegId], 1, 0, 0));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:
    
    m = translate(torsoHeight/2.2, 0.1*torsoWidth, -0.1); 
    m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, tailId, rightLowerLegId );
    break;

    case tailId:

    m = translate(0.0, -0.3*torsoWidth, -0.25); 
    m = mult(m, rotate(theta[tailId], 1, 0, 0));
    figure[tailId] = createNode( m, tail, neckId, null);
    break;

    case leftLowerArmId:

     m = translate(0.0, upperArmHeight, 0.0); 
     m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0); 
    m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0); 
    m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;

    }

}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
   modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function traverseObs(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, obstacle[Id].transform);
   obstacle[Id].render();
   if(obstacle[Id].child != null) traverse(obstacle[Id].child);
   modelViewMatrix = stack.pop();
   if(obstacle[Id].sibling != null) traverse(obstacle[Id].sibling);
}


function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoWidth, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoHeight, torsoWidth, torsoHeight));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function col1(){
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*col1Width, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( col1Height, col1Width, col1Height));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function col2(){
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*col2Width, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( col2Height, col2Width, col2Height));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );   
}

function sbr1(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * sbr1Height, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale4(sbr1Width, sbr1Height, sbr1Width) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );

}

function sbr2(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * sbr2Height, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale4(sbr2Width, sbr2Height, sbr2Width) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );

}



function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function neck(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * neckHeight, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale4(neckWidth, neckHeight, neckWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );   
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++)gl.drawArrays ( gl.TRIANGLES, 0, numVertices );
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices);
}

function tail() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(tailWidth, tailHeight, tailWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function quad(a, b, c, d) {

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);
}

function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


instanceMatrix = mat4();





window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST); //----Animation Stuff

    //
    //  Load shaders and initialize attribute buffers
    //
    
    
    
    const width = gl.canvas.width;
    const height = gl.canvas.height;
    const displayWidth = gl.canvas.clientWidth;
    const displayHeight = gl.canvas.clientHeight;
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program);


    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0); 
    
    modelViewMatrix = mat4(); 


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")


    cube(); //---Texture





    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);


    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );



    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

//----Texture 
    configureTexture();

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex0"), 0);

    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex1"), 1);
//----Texture 
    
     

    //aGGIUNTA

    document.getElementById("IncreaseTh").onclick = function () {
        th += dr;
        console.log(th+"increaseth");
    };
    document.getElementById("DecreaseTh").onclick = function () {
        th -= dr;
    };
    document.getElementById("IncreasePh").onclick = function () {
        phi += dr;
        console.log(Math.sin(phi)+" Phi");
    };
    document.getElementById("DecreasePh").onclick = function () {
        phi -= dr;
    };


    document.getElementById("ButtonAnimate").onclick = function(){flag = !flag;};



    render();
}



var render = function() {
        var k;
        gl.clear( gl.COLOR_BUFFER_BIT);

        for(i=0; i<numNodes; i++) initNodes(i); 
        for(k=0; k<numNodesObs; k++) initNodesObs(k);
        //Making the eye    
        eye = vec3(radius*Math.sin(phi), radius*Math.sin(th), radius*Math.cos(phi));
        modelViewMatrix = lookAt(eye, at , up);
      		if (flag){
      			if(dir){
                    console.log("Torso_loc "+torso_loc);
                    if(torso_loc >= 0.599 && torso_loc <= 1.911 ){
                        theta[torsoId]= 300;
                        theta[rightLowerArmId]= 10;
                        theta[rightUpperArmId]= 20;
                        theta[leftLowerArmId]= 10;
                        theta[leftUpperArmId]= 20;
                        theta[rightLowerLegId]= 10;
                        theta[rightUpperLegId]= 180;
                        theta[leftLowerLegId]= 10;
                        theta[leftUpperLegId]= 180;
                        torso_Y+= 0.01;
                       if(torso_loc >= 1.9799999999999407 && torso_loc <= 3.039){
                            console.log("ci entro");
                            if(theta[rightUpperArmId] < 259) theta[rightUpperArmId] -= 2;
                            if(theta[leftUpperArmId] < 259) theta[leftUpperArmId] -= 2;
                            if(theta[rightUpperLegId] > -100)  theta[rightUpperLegId] -= 4;
                            if(theta[leftUpperLegId] > -100)  theta[leftUpperLegId] -= 4;
                            
                        }


                        
                        


                    }else{
                        
                        theta[leftUpperArmId]+=2;
          				theta[rightUpperArmId]-=2;
          				theta[leftUpperLegId]-=2;
          				theta[rightUpperLegId]+=2;

          				theta[leftLowerArmId]=-70-theta[leftUpperArmId];
          				theta[rightLowerArmId]=-90-theta[rightUpperArmId];
          				theta[leftLowerLegId]=-90-theta[leftUpperLegId];
          				theta[rightLowerLegId]=-70-theta[rightUpperLegId];

                        
                        if(torso_loc <=3.339 && torso_loc >= 3.319) theta[torsoId]=270;

                        if(torso_Y > 6){

                            torso_Y -= 0.01;
                            if(theta[torsoId] > 260) theta[torsoId]-= 20;

                        }
                         if(torso_loc >= 3.1 && torso_loc <= 3.5){

                            theta[rightUpperArmId]= 259;
                            theta[leftUpperArmId]= 259;
                            theta[rightUpperLegId]= -100;
                            theta[leftUpperLegId]= -100;
                        }

          				legAngle-=2;
          				if (legAngle < -125) dir=false;
                    }
      			}
      			if(!dir){
      				
                    
                    if(torso_loc >= 0.599 && torso_loc <= 1.911 ){

                        theta[torsoId]= 300;
                        theta[rightLowerArmId]= 10;
                        theta[rightUpperArmId]= 20;
                        theta[leftLowerArmId]= 10;
                        theta[leftUpperArmId]= 20;
                        theta[rightLowerLegId]= 10;
                        theta[rightUpperLegId]= 180;
                        theta[leftLowerLegId]= 10;
                        theta[leftUpperLegId]= 180;
                        torso_Y+= 0.01;

                        if(torso_loc >= 1.9799999999999407 && torso_loc <= 3.039 ){

                            if(theta[rightUpperArmId] < 259) theta[rightUpperArmId] -= 2;
                            if(theta[leftUpperArmId] < 259) theta[leftUpperArmId] -= 2;
                            if(theta[rightUpperLegId] > -100)  theta[rightUpperLegId] -= 4;
                            if(theta[leftUpperLegId] > -100)  theta[leftUpperLegId] -= 4;
                            
                        }
                        

                        

                    }else{
                           
                            theta[leftUpperArmId]-=2;
                            theta[rightUpperArmId]+=2;
                            theta[leftUpperLegId]+=2;
                            theta[rightUpperLegId]-=2;

                            theta[leftLowerArmId]=-90-theta[leftUpperArmId];
                            theta[rightLowerArmId]=-70-theta[rightUpperArmId];
                            theta[leftLowerLegId]=-70-theta[leftUpperLegId];
                            theta[rightLowerLegId]=-90-theta[rightUpperLegId];
                        
                            if(torso_loc <=3.339 && torso_loc >= 3.319) theta[torsoId]=270;//turn to the original position
                            flag_J = 0;
                            
                            if(torso_Y > 6){//landing of the horse
                                torso_Y -= 0.01;
                                if(theta[torsoId] > 260) theta[torsoId]-= 20;
                            }
                            if(torso_loc >= 3.1 && torso_loc <= 3.5){
                                theta[rightUpperArmId]= 259;
                                theta[leftUpperArmId]= 259;
                                theta[rightUpperLegId]= -100;
                                theta[leftUpperLegId]= -100;
                        }
                            
                            
                        }

      				legAngle+=2;
      				if (legAngle > -75) dir=true;
      			}

      			torso_loc+=0.02;
                

      			if (torso_loc > 8){
                    torso_loc=-7;//If for restart the run
                    theta[rightUpperArmId]= 259;
                    theta[leftUpperArmId]= 259;
                    theta[rightUpperLegId]= -100;
                    theta[leftUpperLegId]= -100;
                      
                } 

      			

              if (torso_loc+torsoWidth+headHeight<eye[0]) ang_1=-ang_1;
      				ang_1 =-90-ang_1;
      				if (Math.abs(ang_1)<100) roll=ang_1;
      				if (Math.abs(ang_2)<45) pitch=ang_2;

      		}
            
      traverseObs(col1Id);
      traverseObs(col2Id);
      traverseObs(sbr1Id);
      traverseObs(sbr2Id);
      traverse(torsoId); 

      
      
      requestAnimFrame(render); 


}
