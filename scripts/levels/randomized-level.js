window.RandomizedLevel = function (levelNo) {
  GAME.objects.clear();

  this.levelNo = levelNo;
  this.ground = new GroundObject();
  GAME.objects.add(this.ground);
  GAME.objects.add(new TestCircle(new THREE.Vector2(0, 0 - 20)));
  this.deleteMeTest = new TestCircle(new THREE.Vector2(2, -5 - 20));
  GAME.objects.add(this.deleteMeTest);
  GAME.objects.add(new TestCircle(new THREE.Vector2(2, -30 - 20)));
  GAME.objects.add(new TestCircle(new THREE.Vector2(-2, -5 - 20)));

  GenerateBuilding(0, 6, 15);

  GenerateBuilding(-8, 5, 10);

  GenerateBuilding(7, 5, 6);
};

RandomizedLevel.prototype.updateRender = function (dt, time, ctx) {
  if (GAME.time > 4) {
    GAME.objects.remove(this.deleteMeTest);
  }
};

RandomizedLevel.prototype.onRemove = function () {
  GAME.objects.clear();
};
