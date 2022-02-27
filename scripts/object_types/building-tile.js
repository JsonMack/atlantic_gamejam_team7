window.BT_SIZE = 2;
window.BT_SIZE_PIXELS = 32;
window.BT_EXP_FORCE = 50000;

window.InitBuildingMaterials = function () {
  const MkMaterial = function (image, falling) {
    if (!image._texture) {
      image._texture = new THREE.Texture(image);
      image._texture.wrapS = THREE.RepeatWrapping;
      image._texture.wrapT = THREE.RepeatWrapping;
      image._texture.mapping = THREE.UVMapping;
      image._texture.needsUpdate = true;
    }
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        tex: { value: image._texture },
      },
      vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv; 
        
                    vec4 mvp = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvp; 
                }
            `,
      fragmentShader: `
                uniform sampler2D tex;
                varying vec2 vUv;

                void main() {
                    gl_FragColor = texture2D(tex, vUv * vec2(1., -1.));
                    ${falling ? `gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(3.)) * 0.5; gl_FragColor.r *= 2.;` : ``}
                }
            `,
    });
    material.side = THREE.DoubleSide;
    material.transparent = true;
    material.needsUpdate = true;
    return material;
  };
  GAME.buildingMaterials = {};
  GAME.buildingMaterials['wall'] = MkMaterial(GAME.images['building-wall']);
  GAME.buildingMaterials['ledge'] = MkMaterial(GAME.images['building-ledge']);
  GAME.buildingMaterials['window'] = MkMaterial(GAME.images['building-window']);
  GAME.buildingMaterials['door'] = MkMaterial(GAME.images['building-door']);
  GAME.buildingMaterials['wall-f'] = MkMaterial(
    GAME.images['building-wall'],
    true
  );
  GAME.buildingMaterials['window-f'] = MkMaterial(
    GAME.images['building-window'],
    true
  );
  GAME.buildingMaterials['door-f'] = MkMaterial(
    GAME.images['building-door'],
    true
  );
  GAME.buildingMaterials['ledge-f'] = MkMaterial(
    GAME.images['building-ledge'],
    true
  );
};

window.GenerateBuilding = function (tileX, width, height) {
  let lookup = {};
  for (let y = height - 1; y >= 0; y--) {
    for (let x = tileX; x < tileX + width; x++) {
      let type = (x + y) % 2 ? 'wall' : 'window';
      if (
        y == 0 &&
        Math.floor(Math.abs(x - (tileX + width * 0.5))) < width * 0.1
      ) {
        type = 'door';
      }
      let hasLedge = false;
      if (!((y + 2) % 3) && y < height - 1) {
        hasLedge = true;
      }
      let tile = new BuildingTile(
        x,
        y,
        type,
        false,
        lookup[x + ',' + (y + 1)],
        hasLedge
      );
      lookup[x + ',' + y] = tile;
      GAME.objects.add(tile);
      GAME.cityHealth++;
      if (hasLedge) {
        if (x == tileX) {
          GAME.objects.add(
            new BuildingTile(x - 1, y, 'ledge', false, null, false, tile)
          );
        } else if (x == tileX + width - 1) {
          GAME.objects.add(
            new BuildingTile(x + 1, y, 'ledge', false, null, false, tile)
          );
        }
      }
    }
  }

  // TEST
  /*setTimeout(() => {
    console.log(GAME.objects.objectList.length);
    lookup[0 + tileX + ',' + 4].explode();
    lookup[1 + tileX + ',' + 5].explode();
    console.log(GAME.objects.objectList.length);
  }, 5000);*/
};

window.BuildingTile = function (
  tileX,
  tileY,
  type,
  falling,
  tileAbove,
  hasLedge,
  heldUpBy
) {
  this.falling = !!falling;
  this.type = type;
  this.tileAbove = tileAbove;
  this.tileX = tileX;
  this.tileY = tileY;
  this.hp = 100;
  this.hasLedge = !!hasLedge;
  this.heldUpBy = heldUpBy || null;

  let bodyDef = new b2BodyDef();
  let fixDef = new b2FixtureDef();
  this.width = BT_SIZE;
  this.height = BT_SIZE;
  bodyDef.type = this.falling ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
  bodyDef.position.x = tileX * BT_SIZE;
  bodyDef.position.y = (GROUND_LEVEL - tileY) * BT_SIZE - 20 - BT_SIZE * 0.5;
  if (this.type === 'ledge') {
    bodyDef.position.y -= BT_SIZE * 0.4;
  }
  fixDef.shape = new b2PolygonShape();
  fixDef.shape.SetAsBox(
    this.width * 0.5,
    type == 'ledge' ? this.height * 0.25 * 0.5 : this.height * 0.5
  );
  fixDef.density = 5.0;
  fixDef.restitution = 0;
  this.body = GAME.world.CreateBody(bodyDef);
  this.body._IsFallingBT = this.falling;
  this.body._IsLedge = (type == 'ledge') && !this.falling;

  this.fixture = this.body.CreateFixture(fixDef);
  this.body.ResetMassData();

  if (this.falling) {
    this.body.ApplyForce(
      new b2Vec2(
        Math.random() * BT_EXP_FORCE - BT_EXP_FORCE * 0.5,
        Math.random() * BT_EXP_FORCE - BT_EXP_FORCE * 0.5
      ),
      new b2Vec2(
        this.body.GetPosition().x + Math.random() * BT_SIZE - BT_SIZE * 0.5,
        this.body.GetPosition().y + Math.random() * BT_SIZE - BT_SIZE * 0.5
      )
    );
    this.body.SetLinearDamping(0.25);
    this.body.SetAngularDamping(0.01);
  }
  this.body._IsBuildingBlock = true;

  let pos = this.body.GetWorldCenter();
  pos = new b2Vec2(pos.x, pos.y);

  if (this.hasLedge) {
    this.geometry2 = new THREE.PlaneBufferGeometry(this.width, this.height);
    this.mesh2 = new THREE.Mesh(
      this.geometry2,
      GAME.buildingMaterials['ledge' + (this.falling ? '-f' : '')]
    );
    this.mesh2.position.set(pos.x, pos.y, -0.5);
    this.mesh2.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');
    GAME.scene.add(this.mesh2);
  }

  this.geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
  this.mesh = new THREE.Mesh(
    this.geometry,
    GAME.buildingMaterials[this.type + (this.falling ? '-f' : '')]
  );
  if (this.type === 'ledge') {
    pos.y += BT_SIZE * 0.4;
  }
  this.mesh.position.set(pos.x, pos.y, 1);
  this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');
  GAME.scene.add(this.mesh);
};

BuildingTile.prototype.makeFalling = function () {
  GAME.objects.remove(this);
  GAME.objects.add(new BuildingTile(this.tileX, this.tileY, this.type, true));
};

BuildingTile.prototype.explode = function () {
  // cascade
  if (!this.falling) {
    let n = this.tileAbove;
    while (n) {
      if (n.destroyed || n.removed) {
        break;
      }
      n.makeFalling();
      n = n.tileAbove;
    }
  }

  // remove
  GAME.particles.explosion(this.body.GetWorldCenter(), 20);
  GAME.objects.remove(this);
  this.destroyed = true;
};

BuildingTile.prototype.updateRender = function (dt, time, ctx) {
  if (this.falling) {
    let pos = this.body.GetWorldCenter();
    this.mesh.position.set(pos.x, pos.y, 1);
    this.mesh.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');
    if (this.mesh2) {
      this.mesh2.position.set(pos.x, pos.y, 1);
      this.mesh2.rotation.set(0, 0, this.body.GetAngle(), 'ZXY');
    }
    this.body.SetAwake(true);

    let vel = this.body.GetLinearVelocity();
    let speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

    if (speed < 1) {
      // Crushing force
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
            (otherBody._IsBuildingBlock &&
              otherBody.GetWorldCenter().y < pos.y) ||
            otherBody._IsGround
          ) {
            this.hp -= dt * (120 + Math.random() * 10);
          }
          if (otherBody._IsBullet) {
            this.hp = 0.;
            if (!otherBody._BulletOP) {
              otherBody._BulletDestroyed = true;
            }
          }
        }
        c = c.next;
      }
    }
    this.hp -= dt * 20;
  }
  else {
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
          this.explode();
          if (!otherBody._BulletOP) {
            otherBody._BulletDestroyed = true;
          }
        }
      }
      c = c.next;
    }
  }
  if (this.heldUpBy && this.heldUpBy.removed) {
    this.hp = 0;
  }
  if (this.hp <= 0) {
    GAME.particles.explosion(this.body.GetWorldCenter(), 20);
    this.destroyed = true;
  }
  return this.hp > 0;
};

BuildingTile.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
  this.body.DestroyFixture(this.fixture);
  GAME.world.DestroyBody(this.body);
  this.removed = true;
  GAME.cityHealth--;
  if (this.mesh2) {
    GAME.scene.remove(this.mesh2);
  }
};
