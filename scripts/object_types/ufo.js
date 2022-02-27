window.GenerateUFO = function () {
  GAME.objects.add(GAME.ufo = new UFO(PLAYER_X + Math.random() * 50));
  GAME.CURRENT_UFO_COUNT++;
};

window.UFO = function () {
  this.geometry = new THREE.PlaneBufferGeometry(BT_SIZE*8, BT_SIZE*8);
  this.texture = new THREE.CanvasTexture(GAME.images['ufo-spritesheet']);
  this.texture.wrapS = THREE.RepeatWrapping;
  this.texture.wrapT = THREE.RepeatWrapping;
  this.texture.mapping = THREE.UVMapping;
  this.texture.needsUpdate = true;
  this.hp = this.maxHP = 100;
  GAME.ufoDefeated = false;
  this.material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 1.0 },
      spriteNo: { value: 0 },
      hFlip: { value: 1 },
      tex: { value: this.texture },
      damage: { value: 0 }
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

  this.mesh.position.set(PLAYER_X, -10 * BT_SIZE, 0.);

  GAME.scene.add(this.mesh);

  this.timeUp = 10;
  this.timeDown = 0;
  this.up = false;
  this.toY = this.y = -10;
  this.x = PLAYER_X;
  this.toX = this.x;
};

UFO.prototype.onRemove = function () {
  GAME.scene.remove(this.mesh);
};

UFO.prototype.updateRender = function (dt, time, ctx) {
  if (this.up) {
    this.timeUp -= dt;
    if (this.timeUp < 0.) {
      this.up = false;
      this.toY = -30;
      this.timeDown = Math.random() * 5 + 5;
      let pos = {x: this.x, y: this.y * BT_SIZE};
      let dx = PLAYER_X - pos.x,
          dy = PLAYER_Y - pos.y;
      let angle = Math.atan2(dy, dx);
    
      GAME.objects.add(
        new Bullet(
          false,
          null,
          BT_SIZE*2,
          new b2Vec2(pos.x, pos.y),
          angle,
          true
        )
      );
    }
  }
  else {
    this.timeDown -= dt;
    if (this.timeDown < 0.) {
      this.up = true;
      this.toY = -10;
      this.timeUp = Math.random() * 5 + 5;
    }
  }
  this.material.uniforms.damage.value = Math.max(0, 1 - this.hp / this.maxHP);
  this.y += (this.toY - this.y) * dt * 4;
  this.toX = PLAYER_X;
  this.x += (this.toX - this.x) * dt * 1;
  this.material.uniforms.spriteNo.value = Math.floor(time * 5) % 2;
  this.mesh.position.set(this.x + (Math.random() * 2 - 1) * this.material.uniforms.damage.value* 0.5, (this.y + Math.sin(time*Math.PI)) * BT_SIZE + (Math.random() * 2 - 1) * this.material.uniforms.damage.value*0.5, 0.);
  if (!(this.hp > 0)) {
    GAME.particles.explosion(new THREE.Vector3(this.x, this.y * BT_SIZE, 0.), 150, true);
    GAME.ufoDefeated = true;
  }
  if (this.hp < 0) {
    this.hp = 0;
  }
  return this.hp > 0;
};