window.GROUND_LEVEL = 20;

window.GroundObject = function (lcoordinate, rcoordinate) {
  let bodyDef = new b2BodyDef();
  let fixDef = new b2FixtureDef();
  this.width = rcoordinate - lcoordinate;
  this.height = 20;
  this.pos = new THREE.Vector2(
    (lcoordinate + rcoordinate) / 2,
    GROUND_LEVEL * BT_SIZE - this.height * 0.5
  );
  bodyDef.type = b2Body.b2_staticBody;
  bodyDef.position.x = this.pos.x;
  bodyDef.position.y = this.pos.y;
  fixDef.shape = new b2PolygonShape();
  fixDef.restitution = 0.1;
  fixDef.friction = 1;
  fixDef.density = 10;

  fixDef.shape.SetAsBox(this.width * 0.5, this.height * 0.5);

  this.body = GAME.world.CreateBody(bodyDef);
  this.body._IsGround = true;
  this.fixture = this.body.CreateFixture(fixDef);

  this.geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
  this.material = new THREE.MeshBasicMaterial({
    color: 0x444444,
    side: THREE.DoubleSide,
  });
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.position.set(this.pos.x, this.pos.y, 0);
  GAME.scene.add(this.mesh);
};

GroundObject.prototype.updateRender = function (dt, time, ctx) {
  return true;
};

GroundObject.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
  this.body.DestroyFixture(this.fixture);
  GAME.world.DestroyBody(this.body);
};
