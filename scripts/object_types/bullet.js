window.Bullet = function(fromBody, pos, angle, op) {

    this.player = player;
    this.radius = 0.25;

    pos = new b2Vec2(
        pos.x + Math.cos(angle) * 2.,
        pos.y + Math.sin(angle) * 2.
    );

    let bodyDef = new b2BodyDef();
    let fixDef = new b2FixtureDef();
    this.radius = radius || 2;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = pos.x;
    bodyDef.position.y = pos.y;
    fixDef.shape = new b2CircleShape(this.radius);
    fixDef.density = 5.0;
    fixDef.restitution = 0.1;
    this.body = GAME.world.CreateBody(bodyDef);
    this.fixture = this.body.CreateFixture(fixDef);

}

Bullet.prototype.updateRender = function(dt, time, ctx) {

    GAME.particles.addParticle(this.body.GetWorldCenter(), new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize().multiplyScalar(this.radius * 8. * Math.random() * 0.25), this.radius * (1 + Math.random()));

};

Bullet.prototype.onRemove = function() {

    this.body.DestroyFixture(this.fixture);
    GAME.world.DestroyBody(this.body);

}