window.RandomizedLevel = function (levelNo) {
  GAME.objects.clear();
  GAME.LEVEL_NUMBER = levelNo;
  this.levelNo = levelNo;
  this.earth = new EarthObject();
  GAME.objects.add(this.earth);

  GAME.objects.add(new BGRender());

  let x = -80;

  while (x < 80) {
    let width = Math.round(Math.random() * 4 + 4);

    if (x + width < -1 || x > 1) {
      GenerateBuilding(x, width, Math.ceil(Math.random() * 10 + 5));
    }

    x += width + 3 + Math.round(Math.random());
  }

  GenerateMainCharacter();
  GenerateEnemy();
  GenerateUFO();
  GenerateHostage();
};

RandomizedLevel.prototype.updateRender = function (dt, time, ctx) {
  // player dies
  if (PLAYER_HEALTH == 0) {
    ctx.fillText('You died', 50, 50);
  }
};

RandomizedLevel.prototype.onRemove = function () {
  GAME.objects.clear();
};
