window.BGRender = function() {
    this.bgTex = new THREE.Texture(GAME.images['bg-2']);
    this.bgTex.wrapS = THREE.RepeatWrapping;
    this.bgTex.wrapT = THREE.RepeatWrapping;
    this.bgTex.mapping = THREE.UVMapping;
    this.bgTex.needsUpdate = true;
    this.material = new THREE.ShaderMaterial({
        uniforms: {
          tex: { value: this.bgTex },
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
                gl_FragColor = texture2D(tex, (vUv * vec2(1., -0.99) - vec2(0., 0.01)) * vec2(50., 1.));
            }
        `,
    });
    this.material.side = THREE.DoubleSide;
    this.material.needsUpdate = true;
    this.geometry = new THREE.PlaneBufferGeometry(1500., 50.);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 0, 50.);
    this.mesh.renderOrder = 100.;
    this.mesh.needsUpdate;
    this.mesh.updateMatrixWorld(true);
    GAME.scene.add(this.mesh);
};

BGRender.prototype.updateRender = function(dt, time, ctx) {
    return true;
};

BGRender.prototype.onRemove = function() {
    GAME.scene.remove(this.mesh);
};