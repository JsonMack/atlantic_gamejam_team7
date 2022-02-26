window.BT_SIZE = 2;
window.BT_SIZE_PIXELS = 32;
window.BT_EXP_FORCE = 0.01;

window.GenerateBuilding = function (tileX, width, height) {
  let lookup = {};
  for (let y = height - 1; y >= 0; y--) {
    for (let x = tileX; x < tileX + width; x++) {
      let type = 'not implemented';
      let tile = new BuildingTile(x, y, type, false, lookup[x + ',' + (y + 1)]);
      lookup[x + ',' + y] = tile;
      GAME.objects.add(tile);
    }
  }

  // TEST
  setTimeout(() => {
    console.log(GAME.objects.objectList.length);
    lookup[0 + tileX + ',' + 4].explode();
    lookup[1 + tileX + ',' + 5].explode();
    console.log(GAME.objects.objectList.length);
  }, 5000);
};

window.BuildingTile = function (tileX, tileY, type, falling, tileAbove) {
  this.falling = !!falling;
  this.type = type;
  this.tileAbove = tileAbove;
  this.tileX = tileX;
  this.tileY = tileY;

  let bodyDef = new b2BodyDef();
  let fixDef = new b2FixtureDef();
  this.width = BT_SIZE;
  this.height = BT_SIZE;
  bodyDef.type = this.falling ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
  bodyDef.position.x = tileX * BT_SIZE;
  bodyDef.position.y = (GROUND_LEVEL - tileY) * BT_SIZE - 20 - BT_SIZE * 0.5;
  fixDef.shape = new b2PolygonShape();
  fixDef.shape.SetAsArray(
    [
      new b2Vec2(-this.width * 0.5, -this.height * 0.5),
      new b2Vec2(this.width * 0.5, -this.height * 0.5),
      new b2Vec2(this.width * 0.5, this.height * 0.5),
      new b2Vec2(-this.width * 0.5, this.height * 0.5),
    ],
    4
  );
  this.body = GAME.world.CreateBody(bodyDef);

  this.fixture = this.body.CreateFixture(fixDef);

  if (this.falling) {
    this.body.SetLinearVelocity(
      new b2Vec2(
        Math.random() * BT_EXP_FORCE - BT_EXP_FORCE * 0.5,
        Math.random() * BT_EXP_FORCE - BT_EXP_FORCE * 0.5
      )
    );
    this.body.SetAngularVelocity(Math.random() * Math.PI - Math.PI * 0.5);
  }

  this.geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
  this.material = new THREE.MeshBasicMaterial({
    color: 0x888888 + Math.floor(Math.random() * 255),
    side: THREE.DoubleSide,
  });
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  let pos = this.body.GetWorldCenter();
  this.mesh.position.set(pos.x, pos.y, 1);
  this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');
  GAME.scene.add(this.mesh);
};

BuildingTile.prototype.makeFalling = function () {
  GAME.objects.remove(this);
  GAME.objects.add(new BuildingTile(this.tileX, this.tileY, this.type, true));
};

BuildingTile.prototype.explode = function () {
  // <-- explosion fx

  if (!this.falling) {
    let n = this.tileAbove;
    while (n) {
      n.makeFalling();
      n = n.tileAbove;
    }
  }

  // remove
  GAME.objects.remove(this);
};

BuildingTile.prototype.updateRender = function (dt, time, ctx) {
  if (this.falling) {
    let pos = this.body.GetWorldCenter();
    this.mesh.position.set(pos.x, pos.y, 1);
    this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');
  }

  return true;
};

BuildingTile.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
  this.body.DestroyFixture(this.fixture);
  GAME.world.DestroyBody(this.body);
};
