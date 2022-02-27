window.RandomizedLevel = function (levelNo) {

  this.lossTime = 0.;
  GAME.objects.clear();
  GAME.LEVEL_NUMBER = levelNo;
  this.levelNo = levelNo;
  this.earth = new EarthObject();
  GAME.objects.add(this.earth);

  GAME.objects.add(new BGRender());
  GAME.cityHealth = 0;

  let x = -80;

  while (x < 80) {
    let width = Math.round(Math.random() * 4 + 4);

    if (x + width < -1 || x > 1) {
      GenerateBuilding(x, width, Math.ceil(Math.random() * 10 + 5));
    }

    x += width + 6 + Math.round(Math.random() * 3);
  }

  console.log("Level no: " + levelNo);
  console.log("Math: " + (.6 + Math.min(.4, GAME.LEVEL_NUMBER * .1)));

  GAME.cityHealth = Math.floor(GAME.cityHealth * (.5 - Math.min(.4, GAME.LEVEL_NUMBER * .05)));
  GAME.maxCityHealth = GAME.cityHealth;

  GenerateMainCharacter();
  GenerateUFO();
  //GenerateHostage();

  this.nextEnemyIn = (10 + (Math.random() * 20) / Math.sqrt(levelNo)) / 3;
};

RandomizedLevel.prototype.lossConditionMet = function() {
  return GAME.PLAYER_HEALTH == 0 || GAME.cityHealth <= 0;
};

RandomizedLevel.prototype.updateRender = function (dt, time, ctx) {
  // player dies
  if (this.lossConditionMet()) {
    this.renderLossScreen(dt, time, ctx);
    return;
  }

  this.nextEnemyIn -= dt;
  if (GAME.MAX_ENEMY_COUNT > GAME.CURRENT_ENEMY_COUNT && this.nextEnemyIn < 0) {
    GAME.objects.add(new Enemy(PLAYER_X + Math.random() * 50));
    GAME.CURRENT_ENEMY_COUNT++;
    console.log('current', GAME.CURRENT_ENEMY_COUNT);
    console.log('max', GAME.MAX_ENEMY_COUNT);
    this.nextEnemyIn =
      (10 + (Math.random() * 20) / Math.sqrt(this.levelNo)) / 2;
  }

  RandomizedLevel.prototype.drawHealthBar(
    ctx,
    32,
    16,
    192,
    24,
    'black',
    GAME.cityHealth,
    GAME.maxCityHealth,
    GAME.images['skyline-small']
  );

  RandomizedLevel.prototype.drawHealthBar(
    ctx,
    GAME.canvas2D.width - 192 - 16,
    16,
    192,
    24,
    'black',
    GAME.ufo.hp,
    GAME.ufo.maxHP,
    GAME.images['ufo-1']
  );

  RandomizedLevel.prototype.drawHealthBar(
    ctx,
    32,
    64,
    192,
    24,
    'black',
    GAME.PLAYER_HEALTH,
    100,
    GAME.images['BB_AA_Billy_Health-Meter']
  );
};

RandomizedLevel.prototype.drawHealthBar = function (
  ctx,
  healthBarX,
  healthBarY,
  healthBarWidth,
  healthBarHeight,
  backgroundColor,
  currentHealth,
  maxHealth,
  image
) {
  const percentage = currentHealth / maxHealth;

  const fillColor =
    percentage < 0.3
      ? 'red'
      : percentage <= 0.5
      ? 'yellow'
      : percentage <= 0.8
      ? 'orange'
      : 'green';

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  const fillWidth = percentage * healthBarWidth;

  ctx.fillStyle = fillColor;

  ctx.fillRect(
    healthBarX + 2,
    healthBarY + 2,
    fillWidth - 4,
    healthBarHeight - 4
  );

  ctx.fillStyle = 'white';
  ctx.font = '14px aldrich';
  ctx.textAlign = 'center';

  ctx.fillText(
    Math.round(currentHealth) + '/' + maxHealth,
    healthBarX + healthBarWidth / 2,
    healthBarY + healthBarHeight - 8
  );

  ctx.textAlign = 'left';
  ctx.drawImage(image, healthBarX - 16, healthBarY - 4, 32, 32);
};

RandomizedLevel.prototype.onRemove = function () {
  GAME.objects.clear();
};

RandomizedLevel.prototype.renderLossScreen = function(dt, time, ctx) {
  let canvas = GAME.canvas2D;

  let width = canvas.width;

  let height = canvas.height;

  ctx.fillStyle = 'black';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1.0;
  ctx.font = '128px aldrich';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText("Game Over", width / 2, height / 2);
  ctx.font = '24px aldrich';
  ctx.fillText("Click anywhere to restart", width / 2, height / 2 + 128);
  ctx.textAlign = 'left';

  this.lossTime += dt || 0;

  if (GAME.mouseClickLeft && this.lossTime > 1.5) {
    GAME.level.onRemove();
    GAME.level = new RandomizedLevel(1);
  }
};
