window.Timestamp = function() { return new Date().getTime() / 1000; };

window.StartGame = function() {

    window.GAME = {
        time: 0.,
        dt: 1/60,
        lastTimeStamp: 0,
        timeStamp: 0,
        vpWidth: 100,
        vpHeight: 100,
        gameWidth: 100,
        mouseScreen: new THREE.Vector2(0, 0),
        mouseWorld: new THREE.Vector3(0, 0, 0),
        mouseLeft: false
    };
    GAME.gameHeight = GAME.gameWidth / 1.6;

    GAME.canvas2D = document.getElementById('canvas2d');
    GAME.canvas3D = document.getElementById('canvas3d');
    GAME.ctx = GAME.canvas2D.getContext('2d');
    GAME.scene = new THREE.Scene();
    GAME.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: GAME.canvas3D
    });
    GAME.renderer.setClearColor("#000000");
    GAME.camera = new THREE.OrthographicCamera( GAME.gameWidth / - 2, GAME.gameWidth / 2, GAME.gameHeight / 2, GAME.gameHeight / - 2, 1, 1000 );
    GAME.scene.add(GAME.camera);

    document.addEventListener('mousemove', (e) => {
        e = e || window.event;
        GAME.mouseScreen.x = e.pageX || 0;
        GAME.mouseScreen.y = e.pageY || 0;
        GAME.mouseWorld.set(
            (e.pageX / GAME.vpWidth) * 2 - 1,
            -(e.pageY / GAME.vpHeight) * 2 + 1,
            5, // since orthographic camera, just needs to be between near & far
        );
        GAME.mouseWorld.unproject(GAME.camera);
    });

    document.addEventListener('mousedown', (e) => {
        e = e || window.event;
        if (e.which == 1) {
            GAME.mouseLeft = true;
        }
    });
    document.addEventListener('mouseup', (e) => {
        e = e || window.event;
        if (e.which == 1) {
            GAME.mouseLeft = false;
            GAME.mouseClickLeft = true;
        }
    });

    LoadGame(() => GameLoop());
};

window.LoadGame = function(onDone) {

    GAME.timeStamp = Timestamp();
    GAME.objects = new ObjectSystem();
    onDone();

};

window.GameLoop = function() {

    requestAnimationFrame(GameLoop);

    GAME.lastTimeStamp = GAME.timeStamp;
    GAME.timeStamp = Timestamp();
    GAME.dt = GAME.dt * 0.5 + (GAME.timeStamp - GAME.lastTimeStamp) * 0.5; // smooth jitter
    GAME.time += GAME.dt;

    // handle resize
    if (GAME.vpWidth != window.innerWidth || GAME.vpHeight != window.innerHeight) {
        GAME.vpWidth = window.innerWidth;
        GAME.vpHeight = window.innerHeight;
        GAME.canvas2D.width = GAME.vpWidth;
        GAME.canvas2D.height = GAME.vpHeight;
        GAME.renderer.setSize(GAME.vpWidth, GAME.vpHeight);
        GAME.gameHeight = GAME.gameWidth / (GAME.vpWidth / GAME.vpHeight);
        GAME.camera.left = GAME.gameWidth / - 2;
        GAME.camera.right = GAME.gameWidth / 2;
        GAME.camera.top = GAME.gameHeight / 2;
        GAME.camera.bottom = - GAME.gameHeight / 2;
        GAME.camera.updateProjectionMatrix();   
    }

    GAME.ctx.clearRect(0, 0, GAME.vpWidth, GAME.vpHeight);
    GAME.ctx.fillStyle = '#FFF';
    GAME.ctx.font = '20px Arial';
    GAME.ctx.fillText(`${Math.round(1/GAME.dt)} fps - mouse screen: ${GAME.mouseScreen.x},${GAME.mouseScreen.y}, mouse world: ${GAME.mouseWorld.x},${GAME.mouseWorld.y}, mouse left: ${GAME.mouseLeft}`, 20, 20);

    GAME.objects.updateRender(GAME.dt, GAME.time, GAME.ctx);

    GAME.renderer.render(GAME.scene, GAME.camera);

    GAME.mouseClickLeft = false;

};