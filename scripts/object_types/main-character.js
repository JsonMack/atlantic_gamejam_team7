window.MC_POS_X = 0;
window.MC_POS_Y = 0;

window.GenerateMainCharacter = function () {
  GAME.objects.add(new MainCharacter());
};

window.MainCharacter = function () {
  let bodyDef = new b2BodyDef();
  let fixDef = new b2FixtureDef();

  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = 0;
  bodyDef.position.y = 0;

  fixDef.shape = new b2PolygonShape();
  fixDef.shape.SetAsBox(BT_SIZE, BT_SIZE*2);
  fixDef.density = 1.;
  this.body = GAME.world.CreateBody(bodyDef);
  this.fixture = this.body.CreateFixture(fixDef);

  this.geometry = new THREE.PlaneBufferGeometry(BT_SIZE, BT_SIZE*2);
  this.material = new THREE.MeshBasicMaterial({
    color: 0xa01010,
    side: THREE.DoubleSide,
  });
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  let pos = this.body.GetWorldCenter();
  this.mesh.position.set(pos.x, pos.y, 1);
  this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');
  GAME.scene.add(this.mesh);
};

MainCharacter.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
  this.body.DestroyFixture(this.fixture);
  GAME.world.DestroyBody(this.body);
};

MainCharacter.prototype.updateRender = function (dt, time, ctx) {
  if (GAME.keyLeft) this.moveLeft();
  if (GAME.keyRight) this.moveRight();
  if (GAME.keyJump) this.jump();

  let pos = this.body.GetWorldCenter();
  this.mesh.position.set(pos.x, pos.y, 1);
  this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');
  return true;
};

MainCharacter.prototype.moveLeft = function () {
  this.body.ApplyForce(new b2Vec2(-this.body.GetMass() * 50, 0), this.body.GetWorldCenter());
};

MainCharacter.prototype.moveRight = function () {
  this.body.ApplyForce(new b2Vec2(this.body.GetMass() * 50, 0), this.body.GetWorldCenter());
};

MainCharacter.prototype.jump = function () {
  this.body.ApplyForce(new b2Vec2(0, -this.body.GetMass() * 20), this.body.GetWorldCenter());
};
