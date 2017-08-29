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
  }
}