window.ObjectSystem = function() {

    this.objectList = [];

};

ObjectSystem.prototype.updateRender = function(dt, time, ctx) {

    for (let i=0; i<this.objectList.length; i++) {
        if (!this.objectList[i].updateRender(dt, time, ctx)) {
            this.remove(this.objectList[i]);
            i --;
            continue;
        }
    }

};

ObjectSystem.prototype.add = function(obj) {

    this.objectList.push(obj);

};

ObjectSystem.prototype.remove = function(obj) {

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

ObjectSystem.prototype.clear = function() {

    while (this.objectList.length) {
        this.remove(this.objectList[0]);
    }

};