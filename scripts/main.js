window.LEVEL_NUM = 0;
window.PLAYER_X = 0;
window.PLAYER_Y = 0;
// images to load
window.LOAD_IMAGES = [
  'alien-1-1.png',
  'alien-1-2.png',
  'alien-2-1.png',
  'alien-2-2.png',
  'alien-3-1.png',
  'alien-3-2.png',
  'ufo-1.png',
  'BB_AA_Billy_Health-Meter.png',
  'ufo-2.png',
  'building-wall.png',
  'building-ledge.png',
  'building-scafolding.png',
  'building-window.png',
  'building-door.png',
  'billy-run-1.png',
  'billy-run-2.png',
  'billy-crouching.png',
  'billy-guarding.png',
  'billy-standing.png',
  'billy-jump.png',
  'bg-2.png',
  'bg-1.png',
  'BB_AA_Start_Screen_2.png',
  'BB_AA_START_Button.png',
  'waterfront.png',
  'ubisoft.png',
  'bluenose.png',
  'skyline-small.png',
]; //['building-blocks.jpg', 'texture.jpg', 'etc.png']; // => { "building-blocks": Image, "texture": Image, "etc": Image }

// adding objects from Box2D library to window object for easier access
window.b2Vec2 = Box2D.Common.Math.b2Vec2;
window.b2BodyDef = Box2D.Dynamics.b2BodyDef;
window.b2Body = Box2D.Dynamics.b2Body;
window.b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
window.b2Fixture = Box2D.Dynamics.b2Fixture;
window.b2World = Box2D.Dynamics.b2World;
window.b2MassData = Box2D.Collision.Shapes.b2MassData;
window.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
window.b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
window.b2ContactListener = Box2D.Dynamics.b2ContactListener;

// gives time now in seconds
window.Timestamp = function () {
  return new Date().getTime() / 1000;
};

// starts the game, it is called onload body
window.StartGame = function () {
  document
    .getElementById('slideshow')
    .parentNode.removeChild(document.getElementById('slideshow'));
  window.GAME = {
    time: 0,
    dt: 1 / 60,
    physicsDt: 1 / 240,
    physicsDtAcc: 0,
    lastTimeStamp: 0,
    timeStamp: 0,
    vpWidth: 100,
    vpHeight: 100,
    gameWidth: 100,
    mouseScreen: new THREE.Vector2(0, 0),
    mouseWorld: new THREE.Vector3(0, 0, 0),
    mouseLeft: false,
    gravity: 20,
    cityHealth: 0,
  };
  GAME.LEVEL_NUMBER = LEVEL_NUM || 1; // LEVEL SET HERE
  GAME.CURRENT_UFO_COUNT = 0;
  GAME.CURRENT_ENEMY_COUNT = 0;
  GAME.MAX_HOSTAGE_COUNT = GAME.LEVEL_NUMBER * 5;
  GAME.CURRENT_HOSTAGE_COUNT = GAME.MAX_HOSTAGE_COUNT;
  GAME.gameHeight = GAME.gameWidth / 1.6;
  GAME.PLAYER_HEALTH = 100;
  GAME.canvas2D = document.getElementById('canvas2d');
  GAME.canvas3D = document.getElementById('canvas3d');
  GAME.ctx = GAME.canvas2D.getContext('2d');

  GAME.scene = new THREE.Scene();
  GAME.renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: GAME.canvas3D,
  });
  GAME.renderer.setClearColor('#293681');
  GAME.camera = new THREE.OrthographicCamera(
    GAME.gameWidth / -2,
    GAME.gameWidth / 2,
    GAME.gameHeight / 2,
    GAME.gameHeight / -2,
    1,
    1000
  );
  GAME.scene.add(GAME.camera);

  document.addEventListener('mousemove', (e) => {
    e = e || window.event;
    GAME.mouseScreen.x = e.pageX || 0;
    GAME.mouseScreen.y = e.pageY || 0;
    GAME.mouseWorld.set(
      (e.pageX / GAME.vpWidth) * 2 - 1,
      -(e.pageY / GAME.vpHeight) * 2 + 1,
      5 // since orthographic camera, just needs to be between near & far
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
  document.body.style.cursor = 'none';
  document.addEventListener('keydown', (e) => {
    e = e || window.event;
    switch (e.keyCode) {
      case 37:
      case 65:
        GAME.keyLeft = true;
        break;
      case 39:
      case 68:
        GAME.keyRight = true;
        break;
      case 32:
        GAME.keyJump = true;
        break;
      default:
        break;
    }
  });
  document.addEventListener('keyup', (e) => {
    e = e || window.event;
    switch (e.keyCode) {
      case 37:
      case 65:
        GAME.keyLeft = false;
        break;
      case 39:
      case 68:
        GAME.keyRight = false;
        break;
      case 32:
        GAME.keyJump = false;
        break;
      default:
        break;
    }
  });

  LoadGame(() => GameLoop());
};

window.LoadSound = function () {
  sounds.load([
    'audio/theme.mp3',
    'audio/gun_boom.wav',
    'audio/og_boom.wav',
    'audio/alien_gun.wav',
    'audio/ufo_gun.wav',
  ]);
  sounds.whenLoaded = () => {
    sounds['audio/theme.mp3'].loop = true;
    sounds['audio/theme.mp3'].volume = 0.5;
    sounds['audio/theme.mp3'].play();
  };
  window.LoadSound = () => {
    document
      .getElementById('entry_animation')
      .parentNode.removeChild(document.getElementById('entry_animation'));
    document.getElementById('difficulty').style.display = 'block';
    window.LoadSound = () => {
      if (LEVEL_NUM) {
        setTimeout(() => StartGame(), 7000);
        document
          .getElementById('difficulty')
          .parentNode.removeChild(document.getElementById('difficulty'));
        document.getElementById('slideshow').style.display = 'block';
        window.LoadSound = () => {};
      }
    };
  };
};

window.LoadGame = function (onDone) {
  image_generator(LOAD_IMAGES, (images) => {
    GAME.images = images;

    GAME.images['billy-spritesheet'] = make_spritesheet(
      [
        'billy-run-1',
        'billy-run-2',
        'billy-crouching',
        'billy-guarding',
        'billy-standing',
        'billy-jump',
      ],
      BT_SIZE_PIXELS,
      8,
      8
    );

    GAME.images['enemy-spritesheet'] = make_spritesheet(
      [
        'alien-1-1',
        'alien-1-2',
        'alien-2-1',
        'alien-2-2',
        'alien-3-1',
        'alien-3-2',
      ],
      BT_SIZE_PIXELS * 2,
      8,
      8
    );
    GAME.images['ufo-spritesheet'] = make_spritesheet(
      ['ufo-1', 'ufo-2'],
      BT_SIZE_PIXELS * 8,
      8,
      8
    );

    InitBuildingMaterials();
    GAME.timeStamp = Timestamp();
    GAME.objects = new ObjectSystem();
    GAME.particles = new ParticleSystem();
    GAME.world = new b2World(new b2Vec2(0, GAME.gravity), false);

    GAME.contactListener = new b2ContactListener();
    GAME.contactListener.PreSolve = (contact) => {
      let fixA = contact.GetFixtureA();
      let fixB = contact.GetFixtureB();
      let bodyA = fixA.GetBody();
      let bodyB = fixB.GetBody();
      if (bodyA._IsFallingBT && !bodyB._IsGround && !bodyB._IsBuildingBlock) {
        contact.SetEnabled(false);
      }
      if (bodyB._IsFallingBT && !bodyA._IsGround && !bodyA._IsBuildingBlock) {
        contact.SetEnabled(false);
      }
      if (bodyA._BulletOP && !bodyB._IsGround) {
        contact.SetEnabled(false);
      }
      if (bodyB._BulletOP && !bodyA._IsGround) {
        contact.SetEnabled(false);
      }
      if (
        bodyA._IsPlayer &&
        bodyA.GetLinearVelocity().y < -1 &&
        bodyB._IsLedge
      ) {
        contact.SetEnabled(false);
      }
      if (
        bodyB._IsPlayer &&
        bodyB.GetLinearVelocity().y < -1 &&
        bodyA._IsLedge
      ) {
        contact.SetEnabled(false);
      }
    };
    //GAME.contactListener.PostSolve = (contact) => {

    //};
    GAME.world.SetContactListener(GAME.contactListener);

    GAME.level = new RandomizedLevel(window.LEVEL_NUM);
    GAME.camera.position.set(window.PLAYER_X, 0, -10);
    GAME.camera.up.set(0, -1, 0);
    GAME.camera.lookAt(new THREE.Vector3(window.PLAYER_X, 0, 0));
    onDone();
  });
};

// takes in array of image file names and generates a hash map with names as keys and image html tags as values
function image_generator(imageEntries, onComplete) {
  const imageHashMap = {};
  let tmpImg;
  let remaining = imageEntries.length;
  imageEntries.forEach((name) => {
    tmpImg = new Image();
    tmpImg.src = 'images/' + name;
    tmpImg.onload = function () {
      remaining--;
      if (remaining <= 0) {
        onComplete(imageHashMap);
      }
    };
    imageHashMap[name.split('.')[0]] = tmpImg;
  });

  if (!remaining) {
    setTimeout(onComplete, 10);
  }

  return imageHashMap;
}

// takes images and makes a sprite sheet
function make_spritesheet(imageNames, tileSize, widthTiles, heightTiles) {
  let canvas = document.createElement('canvas');
  canvas.width = tileSize * widthTiles;
  canvas.height = tileSize * heightTiles;
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let i = 0;
  for (let key of imageNames) {
    let tileX = i % widthTiles;
    let tileY = (i - tileX) / widthTiles;
    ctx.drawImage(GAME.images[key], tileX * tileSize, tileY * tileSize);
    i++;
  }
  return canvas;
}

// game loop
window.GameLoop = function () {
  requestAnimationFrame(GameLoop);

  GAME.lastTimeStamp = GAME.timeStamp;
  GAME.timeStamp = Timestamp();
  GAME.dt = GAME.dt * 0.5 + (GAME.timeStamp - GAME.lastTimeStamp) * 0.5; // smooth jitter
  if (GAME.dt > 1 / 10) {
    GAME.dt = 1 / 10;
  }
  if (GAME.dt < 1 / 300) {
    GAME.dt = 1 / 300;
  }
  GAME.time += GAME.dt;

  // handle resize
  if (
    GAME.vpWidth != window.innerWidth ||
    GAME.vpHeight != window.innerHeight
  ) {
    GAME.vpWidth = window.innerWidth;
    GAME.vpHeight = window.innerHeight;
    GAME.canvas2D.width = GAME.vpWidth;
    GAME.canvas2D.height = GAME.vpHeight;
    GAME.renderer.setSize(GAME.vpWidth, GAME.vpHeight);
    GAME.gameHeight = GAME.gameWidth / (GAME.vpWidth / GAME.vpHeight);
    GAME.camera.left = GAME.gameWidth / -2;
    GAME.camera.right = GAME.gameWidth / 2;
    GAME.camera.top = GAME.gameHeight / 2;
    GAME.camera.bottom = -GAME.gameHeight / 2;

    GAME.camera.updateProjectionMatrix();
  }

  GAME.ctx.clearRect(0, 0, GAME.vpWidth, GAME.vpHeight);
  GAME.ctx.fillStyle = '#FFF';
  GAME.ctx.font = '20px Arial';
  /*GAME.ctx.fillText(
    `${Math.round(1 / GAME.dt)} fps - mouse screen: ${GAME.mouseScreen.x},${
      GAME.mouseScreen.y
    }, mouse world: ${GAME.mouseWorld.x},${GAME.mouseWorld.y}, mouse left: ${
      GAME.mouseLeft
    }`,
    20,
    GAME.canvas2D.height - 32
  );*/
  GAME.ctx.fillStyle = '#ff0000';
  GAME.ctx.fillRect(GAME.mouseScreen.x - 10, GAME.mouseScreen.y - 1, 20, 3);
  GAME.ctx.fillRect(GAME.mouseScreen.x - 1, GAME.mouseScreen.y - 10, 3, 20);

  GAME.physicsDtAcc += GAME.dt;

  while (GAME.physicsDtAcc >= GAME.physicsDt) {
    GAME.world.Step(GAME.physicsDt, 2, 2);
    GAME.physicsDtAcc -= GAME.physicsDt;
  }
  GAME.world.ClearForces();

  GAME.objects.updateRender(GAME.dt, GAME.time, GAME.ctx); //updates the renderer (ObjectSystem function)

  GAME.particles.updateRender(GAME.dt, GAME.time, GAME.ctx);

  GAME.level.updateRender(GAME.dt, GAME.time, GAME.ctx); // looping updates of game

  GAME.renderer.render(GAME.scene, GAME.camera); // render the scene and camera (one time thing)

  GAME.mouseClickLeft = false;
};
