window.Bullet = function(player, fromBody, fromOffset, pos, angle, op) {

    this.player = player;
    this.radius = 0.25;
    this.op = !!op;
    this.fromBody = fromBody;

    let pos2 = new b2Vec2(
        pos.x + Math.cos(angle) * (fromOffset+this.radius),
        pos.y + Math.sin(angle) * (fromOffset+this.radius)
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
    let speed = op ? 30. : 20.;
    this.body.SetLinearVelocity(new b2Vec2(Math.cos(angle) * speed + this.fromBody.GetLinearVelocity().x * 0.1, Math.sin(angle) * speed + this.fromBody.GetLinearVelocity().y * 0.1));
    this.fixture = this.body.CreateFixture(fixDef);
    this.body._IsBullet = true;

    this.life = 3.;

    sounds['audio/gun_boom.wav'].volume = op ? 1.5 : 0.5;
    sounds['audio/gun_boom.wav'].playbackRate = op ? 0.45 : 1.;
    sounds['audio/gun_boom.wav'].play();

};

Bullet.prototype.updateRender = function(dt, time, ctx) {

    GAME.particles.addParticle(this.body.GetWorldCenter(), new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize().multiplyScalar(this.radius * 1. * Math.random() * 0.25), (this.op ? 2. : 1) * 30. * this.radius * (1 + Math.random()));
    if (this.body._BulletDestroyed) {
        this.life = 0.;
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
    return this.life > 0.;

};

Bullet.prototype.onRemove = function() {

    this.body.DestroyFixture(this.fixture);
    GAME.world.DestroyBody(this.body);

};