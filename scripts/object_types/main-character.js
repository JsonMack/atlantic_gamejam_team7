window.MC_POS_X = 0;
window.MC_POS_Y = 0;

window.GenerateMainCharacter = function () {
  GAME.objects.add(new MainCharacter());
};

window.MainCharacter = function () {
  let bodyDef = new b2BodyDef();
  let fixDef = new b2FixtureDef();

  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.fixedRotation = true;
  bodyDef.position.x = 0;
  bodyDef.position.y = (GROUND_LEVEL - 2) * BT_SIZE - 20 + BT_SIZE * 1.5;

  fixDef.shape = new b2PolygonShape();
  fixDef.shape.SetAsBox(BT_SIZE*0.5, BT_SIZE*0.5);
  fixDef.density = 1.;
  fixDef.fricton = 10.;
  fixDef.restitution = 0.0;
  this.body = GAME.world.CreateBody(bodyDef);
  this.fixture = this.body.CreateFixture(fixDef);

  this.geometry = new THREE.PlaneBufferGeometry(BT_SIZE, BT_SIZE);
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
  let pos = this.body.GetWorldCenter();
  this.mesh.position.set(pos.x, pos.y, 1);
  this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');

  let onGround = false;
  let firstContact = this.body.GetContactList();
  let c = firstContact;
  while (c) {
    if (c.contact.IsTouching()) {
      let fixA = c.contact.GetFixtureA();
      let fixB = c.contact.GetFixtureB();
      let otherBody = null;
      if (fixA != this.fixture) {
        otherBody = fixA.GetBody();
      } else {
        otherBody = fixB.GetBody();
      }
      if (
        Math.abs(c.contact.m_manifold.m_localPlaneNormal.y - (fixA == this.fixture ? 1 : -1)) < 0.5
      ) {
        onGround = true;
        break;
      }
    }
    c = c.next;
  }

  this.body.SetLinearDamping(onGround ? 5.0 : 2.);

  if (GAME.keyLeft) this.moveLeft(onGround);
  if (GAME.keyRight) this.moveRight(onGround);
  if (GAME.keyJump && onGround) this.jump();

  return true;
};

MainCharacter.prototype.moveLeft = function (onGround) {
  this.body.ApplyForce(new b2Vec2(-this.body.GetMass() * (onGround ? 50 : 20), 0), this.body.GetWorldCenter());
};

MainCharacter.prototype.moveRight = function (onGround) {
  this.body.ApplyForce(new b2Vec2(this.body.GetMass() * (onGround ? 50 : 20), 0), this.body.GetWorldCenter());
};

MainCharacter.prototype.jump = function () {
  this.body.ApplyForce(new b2Vec2(0, -this.body.GetMass() * 2000), this.body.GetWorldCenter());
};
