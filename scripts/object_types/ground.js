window.GROUND_LEVEL = 20;

window.GroundObject = function (lcoordinate, rcoordinate) {
  let bodyDef = new b2BodyDef();
  let fixDef = new b2FixtureDef();
  this.width = rcoordinate - lcoordinate;
  this.height = 20;
  this.pos = new THREE.Vector2(
    (lcoordinate + rcoordinate) / 2,
    GROUND_LEVEL * BT_SIZE - this.height * 0.5
  );
  bodyDef.type = b2Body.b2_staticBody;
  bodyDef.position.x = this.pos.x;
  bodyDef.position.y = this.pos.y;
  fixDef.shape = new b2PolygonShape();
  fixDef.restitution = 0.1;
  fixDef.friction = 1;
  fixDef.density = 10;

  fixDef.shape.SetAsBox(this.width * 0.5, this.height * 0.5);

  this.body = GAME.world.CreateBody(bodyDef);
  this.body._IsGround = true;
  this.fixture = this.body.CreateFixture(fixDef);

  this.geometry = new THREE.PlaneBufferGeometry(this.width, this.height);
  this.wfTex = new THREE.Texture(GAME.images['waterfront']);
  this.wfTex.wrapS = THREE.RepeatWrapping;
  this.wfTex.wrapT = THREE.RepeatWrapping;
  this.wfTex.mapping = THREE.UVMapping;
  this.wfTex.needsUpdate = true;
  this.material = new THREE.ShaderMaterial({
      uniforms: {
        tex: { value: this.wfTex },
      },
      vertexShader: `
          varying vec2 vUv;
          varying vec3 vWorldPos;

          void main() {
              vUv = uv; 
  
              vec4 mvp = modelViewMatrix * vec4(position, 1.0);
              vWorldPos = (modelMatrix * vec4(position, 1.)).xyz;
              gl_Position = projectionMatrix * mvp; 
          }
      `,
      fragmentShader: `
          uniform sampler2D tex;
          varying vec2 vUv;
          varying vec3 vWorldPos;

          void main() {
              
            vec3 baseClr = vec3(0.0, 0.0, .95);
            if (vUv.y >= 0.05) {
              gl_FragColor = vec4(0.);
            }
            else {
              gl_FragColor = texture2D(tex, vWorldPos.xy);
            }
            gl_FragColor.rgb = mix(baseClr, gl_FragColor.rgb, gl_FragColor.a);
            gl_FragColor.a = 1.;

          }
      `,
  });
  this.material.side = THREE.DoubleSide;
  this.material.needsUpdate = true;
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.position.set(this.pos.x, this.pos.y, 0);
  GAME.scene.add(this.mesh);
};

GroundObject.prototype.updateRender = function (dt, time, ctx) {
  return true;
};

GroundObject.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
  this.body.DestroyFixture(this.fixture);
  GAME.world.DestroyBody(this.body);
};
