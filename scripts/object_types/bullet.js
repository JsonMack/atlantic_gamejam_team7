window.Bullet = function (player, fromBody, fromOffset, pos, angle, op) {
  this.player = player;
  this.radius = 0.25;
  this.op = !!op;
  this.fromBody = fromBody;

  let pos2 = new b2Vec2(
    pos.x + Math.cos(angle) * (fromOffset + this.radius),
    pos.y + Math.sin(angle) * (fromOffset + this.radius)
  );

  let bodyDef = new b2BodyDef();
  let fixDef = new b2FixtureDef();
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = pos2.x;
  bodyDef.position.y = pos2.y;
  fixDef.shape = new b2CircleShape(this.radius);
  fixDef.density = 5.0;
  fixDef.restitution = 0.0;
  this.body = GAME.world.CreateBody(bodyDef);
  this.body._BulletOP = !!op;
  let speed = op ? 30 : 20;
  this.body.SetLinearVelocity(
    new b2Vec2(
      Math.cos(angle) * speed + (this.fromBody ? this.fromBody.GetLinearVelocity().x * 0.1 : 0),
      Math.sin(angle) * speed + (this.fromBody ? this.fromBody.GetLinearVelocity().y * 0.1 : 0)
    )
  );
  this.fixture = this.body.CreateFixture(fixDef);
  this.body._IsBullet = true;

  this.life = 3;

  if (this.player) {
    sounds['audio/gun_boom.wav'].volume = op ? 1.5 : 0.5;
    sounds['audio/gun_boom.wav'].playbackRate = op ? 0.45 : 1;
    sounds['audio/gun_boom.wav'].play();
  }
  else {
    sounds['audio/alien_gun.wav'].volume = 0.25;
    sounds['audio/alien_gun.wav'].playbackRate = 1;
    sounds['audio/alien_gun.wav'].play();
  }
};

Bullet.prototype.updateRender = function (dt, time, ctx) {

  if (GAME.level.winTime > 0.) {
    return false;
  }

  let pos = this.body.GetWorldCenter();
  GAME.particles.addParticle(
    pos,
    new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    )
      .normalize()
      .multiplyScalar(this.radius * 1 * Math.random() * 0.25),
    (this.op ? 2 : 1) * 30 * this.radius * (1 + Math.random()),
    this.player ? false : true
  );
  if (this.body._BulletDestroyed) {
    this.life = 0;
  }
  let firstContact = this.body.GetContactList();
  let c = firstContact;
  while (c) {
    if (c.contact.IsTouching() && c.contact.IsEnabled()) {
      let fixA = c.contact.GetFixtureA();
      let fixB = c.contact.GetFixtureB();
      let otherBody = null;
      if (fixA != this.fixture) {
        otherBody = fixA.GetBody();
      } else {
        otherBody = fixB.GetBody();
      }
      if (!this.op || otherBody._IsGround) {
        this.life = Math.min(this.life, 0.01);
      }
    }
    c = c.next;
  }
  this.life -= dt;
  if (GAME.ufo && GAME.ufo.hp > 0 && this.player) {
    let dist = Math.sqrt(Math.pow(pos.x - GAME.ufo.x, 2.) * 0.75 + 2. * Math.pow(pos.y - GAME.ufo.y * BT_SIZE, 2.));
    if (dist < BT_SIZE*3.5) {
      GAME.ufo.hp -= (this.op ? 10 : 1);
      this.life = 0;
    }
  }
  return this.life > 0;
};

Bullet.prototype.onRemove = function () {
  this.body.DestroyFixture(this.fixture);
  GAME.world.DestroyBody(this.body);
};
