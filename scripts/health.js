window.Health = (value) => {
    this.value = value;

    this.render = (ctx) => {
        GAME.ctx.fillStyle = "#FFF";
        GAME.ctx.font = "20px Arial";
        GAME.ctx.fillText(`${this.health}`, 20, 20);
    };
};