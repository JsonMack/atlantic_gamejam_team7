window.Enemy = function (xpos) {
  let bodyDef = new b2BodyDef();
  let fixDef = new b2FixtureDef();

  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.fixedRotation = true;
  bodyDef.position.x = xpos;
  bodyDef.position.y = -40;

  this.sprColor = Math.floor(Math.random() * 3);

  this.radius = BT_SIZE;
  fixDef.shape = new b2CircleShape(this.radius);
  //fixDef.shape.SetAsBox(BT_SIZE * 0.5, BT_SIZE * 0.5);

  fixDef.density = 1;
  fixDef.friction = 1;
  fixDef.restitution = 0.0;
  this.body = GAME.world.CreateBody(bodyDef);
  this.body._IsEnemy = true;
  this.fixture = this.body.CreateFixture(fixDef);

  this.maxHP = 3;
  this.hp = this.maxHP;

  this.geometry = new THREE.PlaneBufferGeometry(BT_SIZE*2, BT_SIZE*2);
  this.texture = new THREE.CanvasTexture(GAME.images['enemy-spritesheet']);
  this.texture.wrapS = THREE.RepeatWrapping;
  this.texture.wrapT = THREE.RepeatWrapping;
  this.texture.mapping = THREE.UVMapping;
  this.texture.needsUpdate = true;
  this.material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 1.0 },
      spriteNo: { value: 0 },
      hFlip: { value: 1 },
      tex: { value: this.texture },
      damage: { value: 0. }
    },
    vertexShader: `
              varying vec2 vUv;
              uniform float spriteNo, hFlip;

              void main() {
                  vec2 wOff = vec2(mod(spriteNo, 8.), floor(spriteNo/8.));
                  vUv = uv;
                  if (hFlip < 0.) {
                    vUv.x = 1. - vUv.x;
                  }
                  vUv = (vUv * vec2(1., -1.)) / 8. + wOff / 8.;
      
                  vec4 mvp = modelViewMatrix * vec4(position, 1.0);
                  gl_Position = projectionMatrix * mvp; 
              }
          `,
    fragmentShader: `
              uniform sampler2D tex;
              varying vec2 vUv;
              uniform float damage;

              void main() {
                  gl_FragColor = texture2D(tex, vUv);
                  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1., 0., 0.), damage);
              }
          `,
  });
  this.material.side = THREE.DoubleSide;
  this.material.transparent = true;
  this.material.needsUpdate = true;
  this.mesh = new THREE.Mesh(this.geometry, this.material);

  let pos = this.body.GetWorldCenter();
  this.mesh.position.set(pos.x, pos.y, 1);
  this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');

  this.fireT = Math.random() * 11;

  this.moveAwayT = Math.random() * 10;
  this.moveAway = false;

  GAME.scene.add(this.mesh);
};

Enemy.prototype.onRemove = function () {
  GAME.CURRENT_ENEMY_COUNT--;
  GAME.scene.remove(this.mesh);
  this.body.DestroyFixture(this.fixture);
  GAME.world.DestroyBody(this.body);
};

Enemy.prototype.updateRender = function (dt, time, ctx) {
  let pos = this.body.GetWorldCenter();

  this.mesh.position.set(pos.x, pos.y, 1);
  this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');

  this.material.uniforms.spriteNo.value =
    Math.floor(time * 6) % 2 + (this.sprColor * 2);

  // enemy falls in pit
  if (pos.y > 30) {
    pos.y = 0;
    return false;
  }

  this.moveAwayT -= dt;
  if (this.moveAwayT < 0.) {
    this.moveAway = !this.moveAway;
    this.moveAwayT = (5 + Math.random() * 5) * (this.moveAway ? 0.5 : 1.);
  }

  if (this.moveAway) {
    if (PLAYER_X - pos.x <= 0) this.moveLeft();
    if (PLAYER_X - pos.x > 0) this.moveRight();
  }
  else {
    if (PLAYER_X - pos.x <= 0) this.moveRight();
    if (PLAYER_X - pos.x > 0) this.moveLeft();
  }

  this.fireT -= dt;
  if (this.fireT < 0) {
    this.fireT = Math.random() * 11;
    this.fire();
  }

  if (Math.random() < (1/240)) {
    this.jump();
  }

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
      if (otherBody._IsBullet && (c.contact.IsEnabled() || otherBody._BulletOP)) {
        this.hp -= 1;
        if (!otherBody._BulletOP) {
          otherBody._BulletDestroyed = true;
        }
        else {
          this.hp = 0;
        }
      }
    }
    c = c.next;
  }

  this.material.uniforms.damage.value = Math.max(0, 1. - this.hp / this.maxHP);

  if (!(this.hp > 0)) {
    for (let k=0; k<5; k++) {
      GAME.particles.explosion(new THREE.Vector3(this.body.GetWorldCenter().x, this.body.GetWorldCenter().y, 0.), 30);
    }
  }

  return this.hp > 0;
};

Enemy.prototype.fire = function () {
  let pos = this.body.GetWorldCenter();
  let dx = PLAYER_X * (1 + 1 / GAME.LEVEL_NUMBER) - pos.x,
      dy = PLAYER_Y * (1 + 1 / GAME.LEVEL_NUMBER) - pos.y;
  let angle = Math.atan2(dy, dx);

  GAME.objects.add(
    new Bullet(
      false,
      this.body,
      this.radius * 1.1,
      new b2Vec2(pos.x, pos.y),
      angle
    )
  );
};

Enemy.prototype.moveLeft = function () {
  this.material.uniforms.hFlip.value = -1;
  this.body.ApplyForce(
    new b2Vec2(-this.body.GetMass() * 5, 0),
    this.body.GetWorldCenter()
  );
};

Enemy.prototype.moveRight = function () {
  this.material.uniforms.hFlip.value = 1;
  this.body.ApplyForce(
    new b2Vec2(this.body.GetMass() * 5, 0),
    this.body.GetWorldCenter()
  );
};

Enemy.prototype.jump = function () {
  this.body.ApplyForce(
    new b2Vec2(0, -this.body.GetMass() * 1000),
    this.body.GetWorldCenter()
  );
};