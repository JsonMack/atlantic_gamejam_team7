window.GenerateHostage = function () {
  setInterval(() => {
    if (GAME.MAX_HOSTAGE_COUNT > 0) {
      console.log('hostage current', GAME.CURRENT_HOSTAGE_COUNT);
      console.log('hostage max', GAME.MAX_HOSTAGE_COUNT);
      GAME.objects.add(new Hostage(PLAYER_X + Math.random() * 50));
      GAME.MAX_HOSTAGE_COUNT--;
    }
  }, 3000 / GAME.LEVEL_NUMBER);
};

window.Hostage = function (xpos) {
  console.log('hostage current', GAME.CURRENT_HOSTAGE_COUNT);
  let bodyDef = new b2BodyDef();
  let fixDef = new b2FixtureDef();

  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.fixedRotation = true;
  bodyDef.position.x = xpos;
  bodyDef.position.y = (GROUND_LEVEL - 2) * BT_SIZE - 20 + BT_SIZE * 1.5;

  this.radius = BT_SIZE * 0.5;
  fixDef.shape = new b2CircleShape(this.radius);
  //fixDef.shape.SetAsBox(BT_SIZE * 0.5, BT_SIZE * 0.5);

  fixDef.density = 1;
  fixDef.friction = 1;
  fixDef.restitution = 0.0;
  this.body = GAME.world.CreateBody(bodyDef);
  this.body._IsPlayer = true;
  this.fixture = this.body.CreateFixture(fixDef);

  this.geometry = new THREE.PlaneBufferGeometry(BT_SIZE, BT_SIZE);
  this.texture = new THREE.CanvasTexture(GAME.images['Hostage-spritesheet']);
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

              void main() {
                  gl_FragColor = texture2D(tex, vUv);
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
};

Hostage.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
  this.body.DestroyFixture(this.fixture);
  GAME.world.DestroyBody(this.body);
};

Hostage.prototype.updateRender = function (dt, time, ctx) {
  let pos = this.body.GetWorldCenter();

  this.mesh.position.set(pos.x, pos.y, 1);
  this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');

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
        break;
      }
    }
    c = c.next;
  }

  this.material.uniforms.spriteNo.value =
    Math.floor(time * 15) % 2 ? BILLY_RUN_1 : BILLY_RUN_2;

  // Hostage falls in pit
  if (pos.y > 30) {
    this.onRemove();
    GAME.CURRENT_HOSTAGE_COUNT--;
    pos.y = 0;
  }

  return true;
};
