window.EarthObject = function () {
  this.objects = [];
  this.objects.push(new GroundObject(-200, 200));
  this.objects.push(new WatersObject(-800, -200));
  this.objects.push(new WatersObject(200, 800));
};

EarthObject.prototype.updateRender = function (dt, time, ctx) {
  this.objects.forEach((element) => {
    element.updateRender(dt, time, ctx);
  });
  return true;
};

EarthObject.prototype.onRemove = function () {
  this.objects.forEach((element) => {
    element.onRemove();
  });
};
