window.GroundObject = function () {
  let bodyDef = new b2BodyDef();
  let fixDef = new b2FixtureDef();
  this.width = 100;
  this.height = 20;
  this.pos = new THREE.Vector2(0, 40);
  bodyDef.type = b2Body.b2_staticBody;
  bodyDef.position.x = this.pos.x;
  bodyDef.position.y = this.pos.y;
  fixDef.shape = new b2PolygonShape();
  fixDef.shape.SetAsBox(this.width, this.height);
  this.body = GAME.world.CreateBody(bodyDef);
  this.fixture = this.body.CreateFixture(fixDef);

  this.geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
  this.material = new THREE.MeshBasicMaterial({
    color: 0x444444,
    side: THREE.DoubleSide,
  });
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.position.set(this.pos.x, this.pos.y - this.height * 0.5, 0);
  GAME.scene.add(this.mesh);
};

GroundObject.prototype.updateRender = function (dt, time, ctx) {
  return true;
};

GroundObject.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
  // remove body
};
