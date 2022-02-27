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

  this.ubiTex = new THREE.Texture(GAME.images['ubisoft']);
  this.ubiTex.wrapS = THREE.RepeatWrapping;
  this.ubiTex.wrapT = THREE.RepeatWrapping;
  this.ubiTex.mapping = THREE.UVMapping;
  this.ubiTex.needsUpdate = true;

  this.mat2 = new THREE.ShaderMaterial({
    uniforms: {
      tex: { value: this.ubiTex },
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
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
            
          if (vUv.y < 0.01) {
            gl_FragColor = vec4(0.);
          }
          else {
            gl_FragColor = texture2D(tex, vUv * vec2(1., -1.));
          }
        }
    `,
  });
  this.mat2.side = THREE.DoubleSide;
  this.mat2.needsUpdate = true;
  this.mat2.transparent = true;
  this.mesh2 = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10 * BT_SIZE, 10 * BT_SIZE),
    this.mat2
  );
  this.mesh2.position.set(
    0,
    (GROUND_LEVEL - 2) * BT_SIZE - 20 - BT_SIZE * 3,
    2
  );

  this.bnTex = new THREE.Texture(GAME.images['bluenose']);
  this.bnTex.wrapS = THREE.RepeatWrapping;
  this.bnTex.wrapT = THREE.RepeatWrapping;
  this.bnTex.mapping = THREE.UVMapping;
  this.bnTex.needsUpdate = true;

  this.mat3 = new THREE.ShaderMaterial({
    uniforms: {
      tex: { value: this.bnTex },
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
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
            
          if (vUv.y < 0.01) {
            gl_FragColor = vec4(0.);
          }
          else {
            gl_FragColor = texture2D(tex, vUv * vec2(1., -1.));
          }
        }
    `,
  });
  this.mat3.side = THREE.DoubleSide;
  this.mat3.needsUpdate = true;
  this.mat3.transparent = true;
  this.mesh3 = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(9 * BT_SIZE, 9 * BT_SIZE),
    this.mat3
  );
  this.mesh3.position.set(
    0,
    (GROUND_LEVEL - 2) * BT_SIZE - 20 + BT_SIZE * 0.5,
    -1.5
  );

  GAME.scene.add(this.mesh);
  GAME.scene.add(this.mesh2);
  GAME.scene.add(this.mesh3);
};

GroundObject.prototype.updateRender = function (dt, time, ctx) {
  this.mesh3.position.set(
    0,
    (GROUND_LEVEL - 2) * BT_SIZE -
      20 +
      BT_SIZE * 0.5 +
      Math.sin(time * Math.PI * 0.25) * BT_SIZE * 0.1,
    -1.5
  );
  return true;
};

GroundObject.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
  GAME.scene.remove(this.mesh2);
  GAME.scene.remove(this.mesh3);
  this.body.DestroyFixture(this.fixture);
  GAME.world.DestroyBody(this.body);
};
