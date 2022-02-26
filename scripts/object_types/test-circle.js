window.TestCircle = function(position, radius) {
    let bodyDef = new b2BodyDef();
    let fixDef = new b2FixtureDef();
    this.radius = radius || 2;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = position.x;
    bodyDef.position.y = position.y;
    fixDef.shape = new b2CircleShape(this.radius);
    this.body = GAME.world.CreateBody(bodyDef);
    this.fixture = this.body.CreateFixture(fixDef);

    this.geometry = new THREE.SphereGeometry( 1, 20, 20 );
    this.material = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(this.radius, this.radius, this.radius);
    GAME.scene.add(this.mesh);
};

TestCircle.prototype.updateRender = function(dt, time, ctx) {

    let curPos = this.body.GetWorldCenter();
    this.mesh.position.set(curPos.x, curPos.y, 0.);

    return true;

};

TestCircle.prototype.onRemove = function() {
    GAME.scene.remove(this.mesh);
    // remove body
};