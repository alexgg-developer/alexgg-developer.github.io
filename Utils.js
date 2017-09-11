var mps = mps || {};

mps.MaterialKind = 
{
  BASIC: 0,
  LAMBERT: 1,
  PHONG: 2
};

mps.utils = 
{
  getMaterial: function(material) 
  {
    var materialCreated;
    switch(material)
    {
      case mps.MaterialKind.LAMBERT:
        materialCreated = new THREE.MeshLambertMaterial( { color: 0xF6831E } );
        break;
      case mps.MaterialKind.PHONG:
        materialCreated = new THREE.MeshPhongMaterial( { color: 0xF6831E } );
        break;
      case mps.MaterialKind.BASIC:
      default:
        materialCreated = new THREE.MeshBasicMaterial( { color: 0xF6831E } );
        break;
    }
    return materialCreated;
  },
  getRandomNumberFromARange: function(high, low)
  {
    return Math.random() * (high - low) + high;
  },
  printVector3: function(v)
  {
    console.log("(" + v.x + "," + v.y + "," + v.z + ")");
  },
  printVector4: function(v)
  {
    console.log("(" + v.x + "," + v.y + "," + v.z + "," + v.w + ")" );
  },
  getImageData: function( image ) {

      var canvas = document.createElement( 'canvas' );
      canvas.width = image.width;
      canvas.height = image.height;

      var context = canvas.getContext( '2d' );
      context.drawImage( image, 0, 0 );

      return context.getImageData( 0, 0, image.width, image.height );

  },
  getPixel: function( imagedata, x, y ) {

      y = imagedata.height - y;
      var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
      console.log("int position: " + x + "," + y);
      return new THREE.Vector4(data[position], data[ position + 1 ], data[ position + 2 ], data[ position + 3]);
      //return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };

  },
  getMaterial: function(material)
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
  },
  clamp: function(value, valueMin, valueMax)
  {
    var valueClamped = value;
    if(value < valueMin) {
      valueClamped = valueMin;
    }
    else if(value > valueMax) {
      valueClamped = valueMax;
    }
    return valueClamped;
  },
  clampToMin: function(value, valueMin)
  {
    var valueClamped = value;
    if(value < valueMin) {
      valueClamped = valueMin;
    }
    return valueClamped;
  },
  clampToMax: function(value, valueMax)
  {
    var valueClamped = value;
    if(value > valueMax) {
      valueClamped = valueMax;
    }
    return valueClamped;
  }
}