window.WATER_LEVEL = 20;

window.WatersObject = function (lcoordinate, rcoordinate) {
  this.width = rcoordinate - lcoordinate;
  this.height = 20;
  this.pos = new THREE.Vector2(
    (lcoordinate + rcoordinate) / 2,
    WATER_LEVEL * BT_SIZE - this.height * 0.5
  );

  this.geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
  this.material = new THREE.MeshBasicMaterial({
    color: 0x0000f0,
    side: THREE.DoubleSide,
  });
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.position.set(this.pos.x, this.pos.y, 0);
  GAME.scene.add(this.mesh);
};

WatersObject.prototype.updateRender = function (dt, time, ctx) {
  return true;
};

WatersObject.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
};
