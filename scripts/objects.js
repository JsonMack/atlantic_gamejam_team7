/*
this script adds objects to the global (window) object to be used in main.js file later
(abstracting the operations of ObjectSystem)
*/

window.ObjectSystem = function () {
  this.objectList = [];
};

/*
dt   = delta time between frames in seconds
time = time in seconds since the game started, basically the sum of every dt from every frame
ctx  = context (used with canvas 2d) 
*/
ObjectSystem.prototype.updateRender = function (dt, time, ctx) {
  // "this" refers to the ObjectSystem in this function
  for (let i = 0; i < this.objectList.length; i++) {
    if (!this.objectList[i].updateRender(dt, time, ctx)) {
      // if an object's updateRender function doesn't return true, it is deleted
      this.remove(this.objectList[i]);
      i--;
      continue;
    }
  }
};

// pushes object to ObjectSystem
ObjectSystem.prototype.add = function (obj) {
  this.objectList.push(obj);
};

// removes object from ObjectSystem
ObjectSystem.prototype.remove = function (obj) {
  let idx = this.objectList.indexOf(obj);

  if (idx >= 0) {
    this.objectList.splice(idx, 1);
    if (obj.onRemove) {
      obj.onRemove();
    }
    return true;
  }

  return false;
};

// clears entire ObjectSystem
ObjectSystem.prototype.clear = function () {
  while (this.objectList.length) {
     this.remove(this.objectList[0]);
  }

  this.objectList = [];
};
