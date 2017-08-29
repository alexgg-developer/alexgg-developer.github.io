// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------
"use strict";


var camera, renderer, scene;
var cameraControls;
var textureManager;
var canvasWidth, canvasHeight;
var halfCanvasWidth, halfCanvasHeight;
var corners = new Object();
var light, ambientLight;
var MaterialKind = {
  BASIC: 0,
  LAMBERT: 1,
  PHONG: 2
}
//var interactableObjects = [];
var candle;
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();
var sphere;
var lastMousePosition;
var bDragging = false;
var Corner = {
  NONE: 0,
  LEFT: 1,
  RIGHT: 1 << 1,
  TOP: 1 << 2,
  BOTTOM: 1 << 3
}
var cornerOn = Corner.NONE;

function printVector3(v)
{
  console.log("(" + v.x + "," + v.y + "," + v.z + ")");
}

function printVector4(v)
{
  console.log("(" + v.x + "," + v.y + "," + v.z + "," + v.w + ")" );
}

function moveCameraDependingOnCorner(delta)
{
  var CAMERA_SPEED = 50.0;
  var movementVector = new THREE.Vector3();
  if((cornerOn & Corner.BOTTOM) > 0) {
    movementVector.y = -delta * CAMERA_SPEED;
  }
  else if((cornerOn & Corner.TOP) > 0) {
    movementVector.y = delta * CAMERA_SPEED;
  }
  if((cornerOn & Corner.LEFT) > 0) {
    movementVector.x = -delta * CAMERA_SPEED;
  }
  else if((cornerOn & Corner.RIGHT) > 0) {
    movementVector.x = delta * CAMERA_SPEED;
  }

  var test = cornerOn & Corner.RIGHT;

  camera.position.add(movementVector);
  candle.position.add(movementVector);
  light.position.add(movementVector);
  //camera.updateProjectionMatrix();
  //camera.updateMatrix(); // make sure camera's local matrix is updated
  //camera.updateMatrixWorld();
}

function isOnCorner(object, camera, corners)
{
  //candle.geometry.computeBoundingBox();
  var objectWidth = object.geometry.boundingBox.max.x;
  var objectHeight = object.geometry.boundingBox.max.y;
  var sMin = new THREE.Vector3();
  //sMin.x = object.position.x - objectWidth * 0.5;
  sMin.x = object.position.x;
  sMin.y = object.position.y; 
  sMin.z = object.position.z;
   // var sMin = new THREE.Vector4(object.geometry.boundingBox.max.x, 
   //    object.geometry.boundingBox.max.y, object.position.z , 1);
   sphere.position.copy(sMin);
  var sMax = new THREE.Vector3();

  sMax.x = object.position.x + objectWidth;
  sMax.y = object.position.y + objectHeight; 
  sMax.z = object.position.z;
   sphere.position.copy(sMax);
  //var MVP =  new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse )  
  //var sMin = new THREE.Vector3();
  //sMin.copy(object.position);
  camera.updateProjectionMatrix();
  //camera.updateWorldMatrix();
  var projScreenMat = new THREE.Matrix4();
  //projScreenMat.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld);
  //projScreenMat.multiply(camera.projectionMatrix);
  //var matrixWorldInverse = projScreenMat.getInverse( camera.matrixWorld );  
  //projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
  //projScreenMat.multiplyMatrices( camera.projectionMatrix, projScreenMat.getInverse( camera.matrixWorld ) );
  //projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorld );
  //projScreenMat.multiplyMatrices( camera.matrixWorldInverse, camera.projectionMatrix );
  //projScreenMat.multiplyMatrices( camera.projectionMatrix.getInverse(), camera.matrixWorldInverse );
  //sMin.applyMatrix4( projScreenMat );
  sMin.project(camera);
  sMax.project(camera);

  sMin.x = ( sMin.x * halfCanvasWidth ) + halfCanvasWidth;
  sMin.y = - ( sMin.y * halfCanvasHeight ) + halfCanvasHeight;
  sMin.y = canvasHeight - sMin.y;
  
  sMax.x = ( sMax.x * halfCanvasWidth ) + halfCanvasWidth;
  sMax.y = - ( sMax.y * halfCanvasHeight ) + halfCanvasHeight;
  sMax.y = canvasHeight - sMax.y;
  // var vector = new THREE.Vector3(object.geometry.boundingBox.max.x, object.geometry.boundingBox.max.y, object.position.z);

  // var widthHalf = 0.5*renderer.context.canvas.width;
  // var heightHalf = 0.5*renderer.context.canvas.height;

  // //object.updateMatrixWorld();
  // //vector.setFromMatrixPosition(object.matrixWorld);
  // vector.project(camera);

  // vector.x = ( vector.x * widthHalf ) + widthHalf;
  // vector.y = - ( vector.y * heightHalf ) + heightHalf;

  // var x = ( sMin.x * widthHalf ) + widthHalf;
  // var y = - ( sMin.y * heightHalf ) + heightHalf;


  // //var x = ( sMin.x + 1 ) * canvasWidth / 2;
  // //var y = ( - sMin.y + 1) * canvasHeight / 2;

  // console.log("sMinx::" + sMin.x + "sMiny::" + sMin.y);
  // console.log("x::" + x + "y::" + y);
  // console.log("x::" + vector.x + "y::" + vector.y);
  /*console.log("sMax::");
  printVector3(sMax);
  console.log("sMin::");
  printVector3(sMin);
  console.log("corners.top::" + corners.top);
  console.log("corners.bottom::" + corners.bottom);
  console.log("corners.right::" + corners.right);
  console.log("corners.left::" + corners.left);*/

  cornerOn = Corner.NONE;
  if(sMax.x > corners.right) {
    cornerOn |= Corner.RIGHT;
    //console.log("CORNER RIGHT");
  }
  else if (sMin.x < corners.left) {
    cornerOn |= Corner.LEFT;  
    //console.log("CORNER LEFT");
  }

  if(sMax.y > corners.top) {
    cornerOn |= Corner.TOP;
    //console.log("CORNER TOP");
  }
  else if (sMin.y < corners.bottom) {
    cornerOn |= Corner.BOTTOM;  
    //console.log("CORNER BOTTOM");
  }

  //cornerOn = Corner.NONE;
}

function getImageData( image ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );

}

function getPixel( imagedata, x, y ) {

    y = imagedata.height - y;
    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
    console.log("int position: " + x + "," + y);
    return new THREE.Vector4(data[position], data[ position + 1 ], data[ position + 2 ], data[ position + 3]);
    //return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };

}

function getMaterial(material)
{
  var materialCreated;
  switch(material)
  {
    case MaterialKind.LAMBERT:
      materialCreated = new THREE.MeshLambertMaterial( { color: 0xF6831E } );
      break;
    case MaterialKind.PHONG:
      materialCreated = new THREE.MeshPhongMaterial( { color: 0xF6831E } );
      break;
    case MaterialKind.BASIC:
    default:
      materialCreated = new THREE.MeshBasicMaterial( { color: 0xF6831E } );
      break;
  }
  return materialCreated;
}

function drawSquare(x1, y1, x2, y2) {

  var square = new THREE.Geometry();
  // Your code goes here
  square.vertices.push( new THREE.Vector3( x1, y1, 0 ) );
  square.vertices.push( new THREE.Vector3( x2, y1, 0 ) );
  square.vertices.push( new THREE.Vector3( x2, y2, 0 ) );
  square.vertices.push( new THREE.Vector3( x1, y2, 0 ) );

  square.faces.push( new THREE.Face3( 0, 1, 2 ) );
  square.faces.push( new THREE.Face3( 0, 2, 3 ) );

  var square_material = new THREE.MeshPhongMaterial( { color: 0xF6831E, side: THREE.DoubleSide } );
  //var square_material = new THREE.MeshLambertMaterial( { color: 0xF6831E, side: THREE.DoubleSide } );
  var square_mesh = new THREE.Mesh(square, square_material);

  return square_mesh;
}

function drawTexturedSquare(center, texture, material, transparent) {

  if(transparent == undefined) {
    transparent = false;
  }

  var textureMap = textureManager.getTextureByName(texture);
  textureMap.wrapS = textureMap.wrapT = THREE.ClampToEdgeWrapping;
  textureMap.minFilter = THREE.LinearFilter;
  textureMap.magFilter = THREE.LinearFilter;  

  var width = textureMap.image.width;
  var height = textureMap.image.height;

  var square = new THREE.Geometry();
  // Your code goes here
  // var left = center.x - width * 0.5;
  // var right = center.x + width * 0.5;
  // var bottom = center.y - height * 0.5;
  // var top = center.y + height * 0.5;
  // square.vertices.push( new THREE.Vector3( left, bottom, center.z) );
  // square.vertices.push( new THREE.Vector3( right, bottom, center.z ) );
  // square.vertices.push( new THREE.Vector3( right, top, center.z ) );
  // square.vertices.push( new THREE.Vector3( left, top, center.z ) );


  square.vertices.push( new THREE.Vector3( 0, 0, 0) );
  square.vertices.push( new THREE.Vector3( width, 0, 0 ) );
  square.vertices.push( new THREE.Vector3( width, height, 0 ) );
  square.vertices.push( new THREE.Vector3( 0, height, 0 ) );


  var uvs = [];
  uvs.push( new THREE.Vector2( 0, 0 ) );
  uvs.push( new THREE.Vector2( 1.0, 0.0 ) );
  uvs.push( new THREE.Vector2( 1.0, 1.0 ) );
  uvs.push( new THREE.Vector2( 0.0, 1.0 ) );

  square.faces.push( new THREE.Face3( 0, 1, 2 ) );
  square.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2] ] );
  square.faces.push( new THREE.Face3( 0, 2, 3 ) );
  square.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[2], uvs[3] ] );

  square.computeVertexNormals ();

  var square_material = getMaterial(material);
  square_material.side = THREE.DoubleSide;
  square_material.map = textureMap;
  square_material.transparent = transparent;
    // new THREE.MeshPhongMaterial( { 
    // color: 0xF6831E, 
    // side: THREE.DoubleSide,
    // map: textureMap,
    // transparent: transparent });
  //var square_material = new THREE.MeshBasicMaterial( { map: textureMap } );

  //var square_material = new THREE.MeshLambertMaterial( { color: 0xF6831E, side: THREE.DoubleSide } );
    
  var square_mesh = new THREE.Mesh(square, square_material);

  var vertexNormalsHelper = new THREE.VertexNormalsHelper( square_mesh, 10 );
  square_mesh.add( vertexNormalsHelper );

  square_mesh.position.x = center.x - width * 0.5;
  square_mesh.position.y = center.y - height * 0.5;
  square_mesh.position.z = center.z;


  return square_mesh;
}

function createSprite(center, texture) {
  var textureMap = textureManager.getTextureByName(texture);
  textureMap.wrapS = textureMap.wrapT = THREE.ClampToEdgeWrapping;
  var spriteMaterial = new THREE.SpriteMaterial({
    map: textureMap,
    color: 0xffffff
  });  
  var width = spriteMaterial.map.image.width;
  var height = spriteMaterial.map.image.height;
  var sprite = new THREE.Sprite( spriteMaterial );
  sprite.position.set(center.x ,center.y, center.z);
  sprite.scale.set( width, height, 1 );
  scene.add(sprite);
}

function init() {
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener("keydown", onKeyDown, false);
  document.addEventListener("keyup", onKeyUp, false); 

  canvasWidth = 960;
  canvasHeight = 540;
  halfCanvasWidth = canvasWidth * 0.5;
  halfCanvasHeight = canvasHeight * 0.5;
  //bottom, top, left, right
  var margin = 50;
  //corners.push(margin, canvasHeight - margin, margin, canvasWidth - margin);
  corners = { bottom: margin, top: canvasHeight - margin, left: margin, right: canvasWidth - margin };
  var canvasRatio = canvasWidth / canvasHeight;
  var cameraWidth = canvasWidth;
  var cameraHeight = canvasHeight;
  //camera = new THREE.OrthographicCamera(-cameraWidth * 0.5, cameraWidth * 0.5, cameraHeight * 0.5, -cameraHeight * 0.5, 0.01, 20000);
  camera = new THREE.PerspectiveCamera( 45, canvasWidth/ canvasHeight, 0.01, 20000 );
  camera.position.z = 300;
  //camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0xAAAAAA, 1.0);
  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  //cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  //cameraControls = new THREE.FlyControls( camera, renderer.domElement );
  //cameraControls.target.set(0, 0, 0);
  //camera.updateProjectionMatrix();

  light = new THREE.PointLight( 0xffffff, 0.5, 0, 2);
  light.position.set( 30, 30, 10 );

  ambientLight = new THREE.AmbientLight( 0xffffff );
}

function fillScene() {
  scene = new THREE.Scene();
  var sceneAxis = new THREE.AxisHelper(2000);
  scene.add(sceneAxis);
  //var sprite = createSprite(780, 1085, new THREE.Vector3(0, 0, 0), "imgs/fox.jpg");
  //var sprite = createSprite(780, 1085, new THREE.Vector3(0, 0, 0), "imgs/rock.jpg");
  //createSprite(new THREE.Vector3(0, 0, 0), "imgs/fox.jpg");
  // var backgroundSquare = drawSquare(-canvasWidth * 0.5,  - canvasHeight * 0.5,  
  //   canvasWidth * 0.5,  canvasHeight * 0.5);
  //scene.add(backgroundSquare);

  var sphereMaterial = new THREE.MeshBasicMaterial( );
  sphereMaterial.color.r = 1.0;    
  sphereMaterial.color.g = 0.0;
  sphereMaterial.color.b = 0.0;
  sphere = new THREE.Mesh(
    new THREE.SphereGeometry( 1, 32, 16 ), sphereMaterial );
  //sphere.position.copy(light.position);
  scene.add(sphere)

  var img = drawTexturedSquare(new THREE.Vector3(0,0,0), "imgs/fox.jpg", MaterialKind.PHONG);
  scene.add(img);

  /*candle = drawTexturedSquare(
    new THREE.Vector3(light.position.x, light.position.y, light.position.z - 1),
    "imgs/animations/candlelit/candlelit1.png", MaterialKind.BASIC, true);*/
  //candle.geometry.computeBoundingBox();
  var candleParams = new Object();
  candleParams.center = new THREE.Vector3(light.position.x, light.position.y, light.position.z - 1);
  candleParams.textureName = "imgs/animations/candlelit/candlelit";
  candleParams.extension = ".png";
  candleParams.frames = 5;
  candleParams.material = mps.MaterialKind.BASIC;
  candleParams.transparent = true;
  candleParams.timePerFrame = 0.15;
  candle = new AnimatedQuad(candleParams);
  scene.add(candle.getMesh());


  /*var imgTexture = textureManager.getTextureByName("imgs/animations/candlelit/candlelit1.png");
  var imagedata = getImageData( imgTexture.image );
  for(var i = 0; i < imgTexture.image.width; ++i) {
    for(var j = 0; j < imgTexture.image.height; ++j) {
      var color = getPixel( imagedata, i, j );
      console.log("r:" + color.r + " g:" + color.g + " b:" + color.b + " a:" + color.a);
    }
  }*/
  //var color = getPixel( imagedata, 10, 10 );
  //console.log("r:" + color.r + " g:" + color.g + " b:" + color.b + " a:" + color.a);

  scene.add(light);
  //scene.add(ambientLight);
}

function animate() {
  var delta = clock.getDelta();
  //cameraControls.update(delta);
  if(cornerOn != Corner.NONE) {
    moveCameraDependingOnCorner(delta);
  }
  candle.update(delta);
  window.requestAnimationFrame(animate);
  render();

}

function render() {
  renderer.render(scene, camera);
}

function addToDOM() {
  // var container = document.getElementById('container');
  // var canvas = container.getElementsByTagName('canvas');
  // if (canvas.length>0) {
  //     container.removeChild(canvas[0]);
  // }
  // container.appendChild( renderer.domElement );
  document.body.appendChild(renderer.domElement);
}

function transformHDCtoWorld(hdcPosition)
{
  var wPosition = new THREE.Vector3();
  wPosition.copy(hdcPosition);
  wPosition.unproject( camera );
  var dir = wPosition.sub( camera.position ).normalize();
  var distance = - camera.position.z / dir.z;
  wPosition = camera.position.clone().add( dir.multiplyScalar( distance ) );

  return wPosition;
}

function onDocumentMouseDown( event ) 
{
  // console.log("Corner::" + Corner.BOTTOM);
  // var corner = Corner.BOTTOM;
  // if((corner & Corner.TOP) > 0) {
  //   console.log("Bottom");
  // }
  var mouseVector = new THREE.Vector3(
      2 * ( event.clientX / canvasWidth ) - 1,
      1 - 2 * ( event.clientY / canvasHeight ));  
  console.log("mouseDown::" + mouseVector.x + "," + mouseVector.y + "," + mouseVector.z);

  raycaster.setFromCamera( mouseVector, camera );
  // hit testing
  var intersects = raycaster.intersectObject( candle.getMesh() );
  if ( intersects.length > 0 ) {
      intersects[ 0 ].object.material.color.setRGB(
          Math.random(), Math.random(), Math.random() );

      console.log("intersection point::");
      printVector3(intersects[ 0 ].point);
      console.log("position object::");
      printVector3(intersects[0].object.position);

      var pointInObject = new THREE.Vector3();
      pointInObject.subVectors(intersects[0].point, intersects[0].object.position );      
      console.log("pointInObject::");
      printVector3(pointInObject);
      var imagedata = getImageData( candle.material.map.image );
      var colorClicked = getPixel(imagedata, parseInt(pointInObject.x), parseInt(pointInObject.y));
      console.log("color clicked::");
      printVector4(colorClicked);

      // var sphere = new THREE.Mesh( sphereGeom, sphereMaterial );
      // sphere.position = intersects[ 0 ].point;
      // scene.add( sphere );
      // sphere.position = intersectsposition object::nt;
      // sphere.position = intersectsposition object::nt;
      if(colorClicked.w != 0) {
        bDragging = true;
      }
  }
  lastMousePosition = new THREE.Vector2(event.clientX, event.clientY);
}

function checkBoundingBoxOnFrustum(frustum, boundingBox, position)
{
  var minPoint = new THREE.Vector3();
  minPoint.x = boundingBox.min.x + position.x;
  minPoint.y = boundingBox.min.y + position.y;
  minPoint.z = position.z;

  var maxPoint = new THREE.Vector3();
  maxPoint.x = boundingBox.max.x + position.x;
  maxPoint.y = boundingBox.max.y + position.y;
  maxPoint.z = position.z;

  var bIsMinOnFrustum = frustum.containsPoint(minPoint);
  var bIsMaxOnFrustum = frustum.containsPoint(maxPoint);

  return bIsMaxOnFrustum && bIsMinOnFrustum;
}

function onDocumentMouseMove( event ) 
{
  var mouseVector = new THREE.Vector3(
      2 * ( event.clientX / canvasWidth ) - 1,
      1 - 2 * ( event.clientY / canvasHeight ));

  
  //console.log("canvasWidth::" + canvasWidth);
  //console.log("mouseMove::" + mouseVector.x + "," + mouseVector.y + "," + mouseVector.z);
  //mouseVector.unproject(camera);
  //console.log("mouseMove unproj::" + mouseVector.x + "," + mouseVector.y + "," + mouseVector.z);
  //console.log("screen::" + event.clientX + "," + event.clientY);
  var unProjectedScreen = new THREE.Vector3(event.clientX, event.clientY, -1);
  unProjectedScreen.unproject(camera);
  //console.log("unprojected::" + unProjectedScreen.x + "," + unProjectedScreen.y + "," + unProjectedScreen.z);

  var matrix = new THREE.Matrix4();
  //matrix.multiplyMatrices(matrix.getInverse( camera.matrixWorld ), matrix.getInverse(camera.projectionMatrix) );
  //matrix.multiplyMatrices(matrix.getInverse( camera.projectionMatrix ), matrix.getInverse(camera.matrixWorld) );
  //matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorld );
  var unProjected = new THREE.Vector4();
  unProjected.copy(mouseVector);
  unProjected.applyMatrix4(matrix);

  // sphere.position.copy(unProjected);
  // sphere.position.z = 0;
  //console.log("unprojected::" + unProjected.x + "," + unProjected.y + "," + unProjected.z);
  var newMousePosition = transformHDCtoWorld(mouseVector);

  if(lastMousePosition != undefined) {
    var hdcLastMousePosition = new THREE.Vector3(
      2 * ( lastMousePosition.x / canvasWidth ) - 1,
      1 - 2 * ( lastMousePosition.y / canvasHeight ));
    hdcLastMousePosition = transformHDCtoWorld(hdcLastMousePosition);
    var movementVector = new THREE.Vector3();
    movementVector.subVectors(newMousePosition, hdcLastMousePosition);
    if(bDragging) {
      var wasOnCorner = cornerOn != Corner.NONE;
      isOnCorner(candle, camera, corners);
      printVector3(movementVector);
      //if(!wasOnCorner && cornerOn == Corner.NONE) {
        candle.position.add(movementVector);
        light.position.add(movementVector); 
        //console.log("dragging");  

        var frustum = new THREE.Frustum();
        frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );

        //candle.geometry.computeBoundingBox();
      //}
      
      //if(frustum.containsPoint(newMousePosition)) {
        //console.log('within camera view');      
      //} else {
      /*if(!checkBoundingBoxOnFrustum(frustum, candle.geometry.boundingBox, candle.position)) {
        console.log('outside camera view');
        //camera.position.add(movementVector);
        //camera.updateProjectionMatrix();
        //camera.updateMatrix(); // make sure camera's local matrix is updated
        //camera.updateMatrixWorld(); // make sure camera's world matrix is updated
        //camera.matrixWorldInverse.getInverse( camera.matrixWorld );
      }*/
      
    } 

    lastMousePosition.x = event.clientX;
    lastMousePosition.y = event.clientY;
  }


  //sphere.position.copy(pos);
  //console.log("pos::");
  //printVector3(pos);


}


function onDocumentMouseUp( event ) 
{
  lastMousePosition = undefined;
  bDragging = false;
}

function onKeyDown(event)
{
  //38 -> up
  //37 -> left
  //39 -> right
  //40 -> down
  var keyCode = event.keyCode; 
  switch(keyCode) {
    case 33: //numpad9
      cornerOn = Corner.TOP | Corner.RIGHT;
      break;
    case 36: //numpad7
      cornerOn = Corner.TOP | Corner.LEFT;
      break;
    case 34: //numpad3
      cornerOn = Corner.BOTTOM | Corner.RIGHT;
      break;
    case 35: //numpad1
      cornerOn = Corner.BOTTOM | Corner.LEFT;
      break;
    case 37:
      cornerOn = Corner.LEFT;
      break;
    case 38:
      cornerOn = Corner.TOP;
      break;
    case 39:
      cornerOn = Corner.RIGHT;
      break;
    case 40:
      cornerOn = Corner.BOTTOM;
      break;
    default:
      cornerOn = Corner.NONE;
      break;
  }
}

function onKeyUp(event)
{
  var keyCode = event.keyCode;
  cornerOn = Corner.NONE;
}

function onAllTexturesLoaded()
{
  //try {
    init();
    fillScene();
    addToDOM();
    animate();
  // } catch (e) {
  //   var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
  //   //$('#container').append(errorReport+e);
  //   console.log(errorReport + e);
  // }

}

function loadTextures()
{
  var textureAnimations = [["imgs/animations/candlelit/candlelit", 5, ".png"]];
  textureManager = new TextureManager(["imgs/rock.jpg", "imgs/fox.jpg"], textureAnimations, onAllTexturesLoaded);
}

loadTextures();