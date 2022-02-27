window.MAX_PRT = 16384;

window.ParticleSystem = function () {
  this.list = [];

  this.geometry = new THREE.BufferGeometry();
  this.positions = new Float32Array(MAX_PRT * 3);
  this.velocities = new Float32Array(MAX_PRT * 3);
  this.attr1 = new Float32Array(MAX_PRT * 4);

  for (let i = 0; i < MAX_PRT; i++) {
    this.attr1[i * 4 + 0] = -1000;
    this.attr1[i * 4 + 1] = 1;
  }

  this.posAttr = new THREE.BufferAttribute(this.positions, 3);
  this.velAttr = new THREE.BufferAttribute(this.velocities, 3);
  this.at1Attr = new THREE.BufferAttribute(this.attr1, 4);

  this.geometry.setAttribute('position', this.posAttr);
  this.geometry.setAttribute('velocity', this.velAttr);
  this.geometry.setAttribute('attr1', this.at1Attr);

  this.addPtr = 0;

  this.material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
        //attribute vec3 offset;
        attribute vec3 velocity;
        attribute vec4 attr1; // vec4(start_time, life, radius, not used)
        uniform float time;
        
        varying float vTime, vGreen;
        void main() {
            vTime = (time - attr1.x) / attr1.y;
            if (vTime >= 0. && vTime < 1.) {
                vec3 pos2 = position + (velocity - vec3(0., 300. / pow(attr1.z, 2.), 0.)) * pow(vTime, 0.5) + vec3(0., 1., 0.) * pow(time - attr1.x, 0.5);
                if (pos2.y > 20.) {
                    pos2.y = 20.;
                }
                pos2.z = 0.;
                
                vec4 mvp = modelViewMatrix * vec4(pos2, 1.0);
                gl_Position = projectionMatrix * mvp;
                gl_PointSize = (attr1.z * (1. + pow(vTime, 0.5)*3.));
                vGreen = attr1.w;
            }
            else {
                gl_PointSize = 1.;
                vec4 mvp = modelViewMatrix * vec4(vec3(0.), 1.0);
                gl_Position = projectionMatrix * mvp;
            }
        }
    `,
    fragmentShader: `
        varying float vTime, vGreen;
        uniform float time;
        void main() {
            if (vTime < 0. || vTime >= 1.) {
                discard;
            }
            else {
                gl_FragColor = mix(vGreen > 0.5 ? vec4(0.125, 1., 0.25, 0.5) : vec4(1., 0.25, 0.125, 0.5), vec4(0.25, 0.25, 0.25, 0.), vTime) * clamp(1. - length(gl_PointCoord.xy - vec2(0.5)) / 0.5, 0., 1.);
            }
        }
    `,
  });
  this.material.side = THREE.DoubleSide;
  this.material.blending = THREE.AdditiveBlending;
  this.material.transparent = true;
  this.material.depthTest = false;
  this.material.depthWrite = false;
  this.material.needsUpdate = true;

  this.mesh = new THREE.Points(this.geometry, this.material);
  this.mesh.frustumCulled = false;
  this.mesh.renderOrder = 1;
  this.mesh.needsUpdate = true;
  this.mesh.position.set(0, 0, 0);
  this.mesh.updateMatrixWorld(true);

  GAME.scene.add(this.mesh);
};

ParticleSystem.prototype.updateRender = function (dt, time, ctx) {
  this.material.uniforms.time.value = time;
};

ParticleSystem.prototype.addParticle = function (p0, v0, size, green) {
  let idx = this.addPtr;
  this.addPtr = (this.addPtr + 1) % MAX_PRT;
  this.positions[idx * 3 + 0] = p0.x;
  this.positions[idx * 3 + 1] = p0.y;
  this.positions[idx * 3 + 2] = p0.z || 0;
  this.velocities[idx * 3 + 0] = v0.x;
  this.velocities[idx * 3 + 1] = v0.y;
  this.velocities[idx * 3 + 2] = v0.z || 0;
  this.attr1[idx * 4 + 0] = GAME.time;
  this.attr1[idx * 4 + 1] = 5; //Math.sqrt(size) * 2;
  this.attr1[idx * 4 + 2] = size;
  this.attr1[idx * 4 + 3] = green ? 1 : 0;
  this.posAttr.needsUpdate = true;
  this.velAttr.needsUpdate = true;
  this.at1Attr.needsUpdate = true;
};

ParticleSystem.prototype.explosion = function (center, size, green) {
  let count = size * Math.sqrt(size);
  for (let i = 0; i < count; i++) {
    this.addParticle(
      center,
      new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      )
        .normalize()
        .multiplyScalar(size * Math.random() * 0.25),
      4 * Math.sqrt(size) * (0.2 + Math.random() * 0.75),
      !!green
    );
  }

  let dist = Math.sqrt(
    Math.pow(center.x - GAME.camera.position.x, 2),
    Math.pow(center.y - GAME.camera.position.y, 2)
  );

  sounds['audio/og_boom.wav'].volume = Math.min(
    0.5,
    (0.05 * size) / Math.sqrt(dist)
  );
  sounds['audio/og_boom.wav'].playbackRate = 1 / Math.sqrt(size);
  sounds['audio/og_boom.wav'].play();
};

ParticleSystem.prototype.destroy = function () {
  GAME.scene.remove(this.mesh);
};
