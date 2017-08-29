"use strict";

class TextureManager {

  constructor (texturesToLoad, animationsToLoad, onAllTexturesLoaded) {
    this.textureMaps = new Object();
    this.loadingTextures = 0;
    this.onAllTexturesLoaded = onAllTexturesLoaded;
    if(texturesToLoad != undefined) {        
      this.loadingTextures += texturesToLoad.length;
    }

    if(animationsToLoad != undefined) {
      for(var i = 0; i < animationsToLoad.length; i++) {
        this.loadingTextures += animationsToLoad[i][1];   
      }
    }

    var textureLoader = new THREE.TextureLoader();
    if(texturesToLoad != undefined) {
      //var textureLoader = new THREE.TextureLoader();
      var that = this;
      for(var i = 0; i < texturesToLoad.length; ++i) {        
        var textureMap = textureLoader.load(texturesToLoad[i], function(texture) {
          that.onTextureLoaded(texture);
        },
        undefined,
        function(xhr) {
          --that.loadingTextures;
          console.log("Error trying to load: " + xhr.currentTarget.currentSrc);
          that.checkFinished();
        });
      }
    }

    if(animationsToLoad != undefined) {
      var that = this;
      for(var i = 0; i < animationsToLoad.length; ++i) {        
        this.loadAnimationTextures(animationsToLoad[i][0], animationsToLoad[i][1], animationsToLoad[i][2])
      }
    }

  }

  onTextureLoaded(texture) {
    var domain = window.location.protocol + "//" + window.location.hostname + "/";
    //console.log(domain);
    console.log(texture.image.src.replace(domain, ""));
    var fileName = texture.image.src.replace(domain, "");
    this.textureMaps[fileName] = texture;
    --this.loadingTextures;
    this.checkFinished();
  }

  getTextureByName(textureName) {
    return this.textureMaps[textureName];
  }

  areAllTexturesLoaded() {
    return this.loadingTextures == 0;
  }

  checkFinished() {    
    if(this.areAllTexturesLoaded()) {
      this.onAllTexturesLoaded();  
    }
  }

  loadAnimationTextures(textureName, frames, extension ) {
    var that = this;
    var textureLoader = new THREE.TextureLoader();
    for(var i = 0; i < frames; ++i) {
      //++this.loadingTextures;
      var textureMap = textureLoader.load(textureName + i + extension, function(texture) {
        that.onTextureLoaded(texture);
      },
      undefined,
      this.onErrorLoadingTexture);
    }
  }

  onErrorLoadingTexture(xhr)
  {
    --that.loadingTextures;
    console.log("Error trying to load: " + xhr.currentTarget.currentSrc);
    that.checkFinished();
  }

}