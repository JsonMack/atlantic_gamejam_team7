window.PLAYER_HEALTH = 100;
window.PLAYER_X = 0;
window.PLAYER_MIN_X = -500;
window.PLAYER_MAX_X = 500;
window.PLAYER_Y = 0;

window.BILLY_RUN_1 = 0;
window.BILLY_RUN_2 = 1;
window.BILLY_LAND = 2;
window.BILLY_GAURD = 3;
window.BILLY_STAND = 4;
window.BILLY_JUMP = 5;

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

  this.radius = BT_SIZE * 0.5;
  fixDef.shape = new b2CircleShape(this.radius);
  //fixDef.shape.SetAsBox(BT_SIZE * 0.5, BT_SIZE * 0.5);

  fixDef.density = 1;
  fixDef.friction = 10;
  fixDef.restitution = 0.0;
  this.body = GAME.world.CreateBody(bodyDef);
  this.body._IsPlayer = true;
  this.fixture = this.body.CreateFixture(fixDef);

  this.geometry = new THREE.PlaneBufferGeometry(BT_SIZE, BT_SIZE);
  this.texture = new THREE.CanvasTexture(GAME.images['billy-spritesheet']);
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
      chargeT: { value: 0 },
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
              uniform float chargeT;

              void main() {
                  gl_FragColor = texture2D(tex, vUv);
                  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.), chargeT);
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

  GAME.scene.add(this.mesh);

  this.fireT = 0;
  this.chargeT = 0;
};

MainCharacter.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
  this.body.DestroyFixture(this.fixture);
  GAME.world.DestroyBody(this.body);
};

MainCharacter.prototype.updateRender = function (dt, time, ctx) {
  let pos = this.body.GetWorldCenter();
  if (pos.y > 30) PLAYER_HEALTH = 0; // if player falls in water
  window.PLAYER_X = pos.x;
  window.PLAYER_Y = pos.y;
  this.mesh.position.set(
    pos.x + (Math.random() * 2 - 1) * this.chargeT * 0.5,
    pos.y + (Math.random() * 2 - 1) * this.chargeT * 0.5,
    1
  );
  this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');

  GAME.camera.position.set(window.PLAYER_X, 0, -10);
  GAME.camera.up.set(0, -1, 0);
  GAME.camera.lookAt(new THREE.Vector3(window.PLAYER_X, 0, 0));

  let onGround = false;
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
      if (
        Math.abs(
          c.contact.m_manifold.m_localPlaneNormal.y -
            (fixA == this.fixture ? 1 : -1)
        ) < 0.5
      ) {
        onGround = true;
        break;
      }
    }
    c = c.next;
  }

  if (!onGround) {
    this.material.uniforms.spriteNo.value = BILLY_JUMP;
  } else if (GAME.keyLeft || GAME.keyRight) {
    this.material.uniforms.spriteNo.value =
      Math.floor(time * 15) % 2 ? BILLY_RUN_1 : BILLY_RUN_2;
  } else {
    this.material.uniforms.spriteNo.value = BILLY_STAND;
  }
  this.material.uniforms.chargeT.value = this.chargeT;

  this.body.SetLinearDamping(onGround ? 5.0 : 2);

  if (GAME.keyLeft) this.moveLeft(onGround);
  if (GAME.keyRight) this.moveRight(onGround);
  if (GAME.keyJump && onGround) this.jump();
  if (GAME.mouseLeft) this.fire();

  this.fireT -= dt * 2;

  return true;
};

MainCharacter.prototype.fire = function () {
  if (this.fireT > 0) {
    return;
  }
  let pos = this.body.GetWorldCenter();
  let dx = GAME.mouseWorld.x - pos.x,
    dy = GAME.mouseWorld.y - pos.y;
  let angle = Math.atan2(dy, dx);

  this.chargeT += 1 / (4 + Math.random());

  GAME.objects.add(
    new Bullet(
      true,
      this.body,
      this.radius * 1.1,
      new b2Vec2(pos.x, pos.y),
      angle,
      this.chargeT >= 1
    )
  );

  if (this.chargeT >= 1) {
    this.chargeT -= 1;
  }
  this.fireT = 1;
};

MainCharacter.prototype.moveLeft = function (onGround) {
  this.material.uniforms.hFlip.value = -1;
  if (window.PLAYER_X > window.PLAYER_MIN_X) {
    this.body.ApplyForce(
      new b2Vec2(-this.body.GetMass() * (onGround ? 70 : 30), 0),
      this.body.GetWorldCenter()
    );
  }
};

MainCharacter.prototype.moveRight = function (onGround) {
  this.material.uniforms.hFlip.value = 1;
  if (window.PLAYER_X < window.PLAYER_MAX_X) {
    this.body.ApplyForce(
      new b2Vec2(this.body.GetMass() * (onGround ? 70 : 20), 0),
      this.body.GetWorldCenter()
    );
  }
};

MainCharacter.prototype.jump = function () {
  this.body.ApplyForce(
    new b2Vec2(0, -this.body.GetMass() * 2800),
    this.body.GetWorldCenter()
  );
};
