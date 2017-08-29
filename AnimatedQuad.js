"use strict";


class AnimatedQuad {

  /**
  * center, textureName, materialKind, transparent, frames, extension, timePerFrame
  */
  constructor (params) 
  {
    if(params.transparent == undefined) {
      this.transparent = false;
    }
    else {
      this.transparent = params.transparent;
    }
    this.frames = params.frames;
    this.timePerFrame = params.timePerFrame;
    this.timeElapsedSinceLastFrame = 0;
    this.currentFrame = 0;
    this.textureName = params.textureName;
    this.extension = params.extension;

    var textureMap = textureManager.getTextureByName(this.textureName + this.currentFrame + this.extension);
    textureMap.wrapS = textureMap.wrapT = THREE.ClampToEdgeWrapping;
    textureMap.minFilter = THREE.LinearFilter;
    textureMap.magFilter = THREE.LinearFilter;  

    var width = textureMap.image.width;
    var height = textureMap.image.height;

    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push( new THREE.Vector3( 0, 0, 0) );
    this.geometry.vertices.push( new THREE.Vector3( width, 0, 0 ) );
    this.geometry.vertices.push( new THREE.Vector3( width, height, 0 ) );
    this.geometry.vertices.push( new THREE.Vector3( 0, height, 0 ) );

    var uvs = [];
    uvs.push( new THREE.Vector2( 0, 0 ) );
    uvs.push( new THREE.Vector2( 1.0, 0.0 ) );
    uvs.push( new THREE.Vector2( 1.0, 1.0 ) );
    uvs.push( new THREE.Vector2( 0.0, 1.0 ) );

    this.geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
    this.geometry.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2] ] );
    this.geometry.faces.push( new THREE.Face3( 0, 2, 3 ) );
    this.geometry.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[2], uvs[3] ] );

    this.geometry.computeVertexNormals ();
    this.geometry.computeBoundingBox();

    this.material = mps.utils.getMaterial(params.material);
    this.material.side = THREE.DoubleSide;
    this.material.map = textureMap;
    this.material.transparent = this.transparent;
      
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.x = params.center.x - width * 0.5;
    this.mesh.position.y = params.center.y - height * 0.5;
    this.mesh.position.z = params.center.z;
    this.position = this.mesh.position;
  }

  update(delta)
  {
    this.timeElapsedSinceLastFrame += delta;
    if(this.timeElapsedSinceLastFrame > this.timePerFrame) {
      this.timeElapsedSinceLastFrame -= this.timePerFrame;
      ++this.currentFrame;
      if(this.currentFrame == this.frames) {
        this.currentFrame = 0;
      }
      this.changeTextureToCurrentFrame();
    }
  }

  changeTextureToCurrentFrame()
  {    
    var textureMap = textureManager.getTextureByName(this.textureName + this.currentFrame + this.extension);
    console.log(this.textureName + this.currentFrame + this.extension);
    textureMap.wrapS = textureMap.wrapT = THREE.ClampToEdgeWrapping;
    textureMap.minFilter = THREE.LinearFilter;
    textureMap.magFilter = THREE.LinearFilter;
    this.material.map = textureMap;
  }

  getMesh()
  {
    return this.mesh;
  }
}