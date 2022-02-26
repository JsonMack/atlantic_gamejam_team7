window.RandomizedLevel = function(levelNo) {
    GAME.objects.clear();

    this.levelNo = levelNo;
    this.ground = new GroundObject();
    GAME.objects.add(this.ground);
    GAME.objects.add(new TestCircle(new THREE.Vector2(0, 0)));
    this.deleteMeTest = new TestCircle(new THREE.Vector2(2, -5));
    GAME.objects.add(this.deleteMeTest);
    GAME.objects.add(new TestCircle(new THREE.Vector2(2, -30)));
    GAME.objects.add(new TestCircle(new THREE.Vector2(-2, -5)));
};

RandomizedLevel.prototype.updateRender = function(dt, time, ctx) {

    if (GAME.time > 4) {
        GAME.objects.remove(this.deleteMeTest);
    }

};

RandomizedLevel.prototype.onRemove = function() {
    GAME.objects.clear();
};