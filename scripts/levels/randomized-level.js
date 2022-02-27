window.RandomizedLevel = function (levelNo) {
  GAME.objects.clear();

  this.levelNo = levelNo;
  this.earth = new EarthObject();
  GAME.objects.add(this.earth);

  GAME.objects.add(new BGRender());

  let x = -80;

  while (x < 80) {
    let width = Math.round(Math.random() * 4 + 4);

    while (!(x + width < -4 || x > 4)) {
      x += 1;
    }

    GenerateBuilding(x, width, Math.ceil(Math.random() * 10 + 5));

    x += width + 3 + Math.round(Math.random());
  }

  GenerateMainCharacter();
  // GenerateEnemyCharacter();
};

RandomizedLevel.prototype.updateRender = function (dt, time, ctx) {};

RandomizedLevel.prototype.onRemove = function () {
  GAME.objects.clear();
};
