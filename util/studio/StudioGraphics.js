var colors = require("colors");

var StudioGraphics = function(screen){
	this.screen = screen;
}

StudioGraphics.prototype.drawText = function(x, y, t) {
	colors.reset();

	this.screen.goto(x, y);
	this.screen.print(t);
	this.screen.goto(0, 0);
}

StudioGraphics.prototype.drawBox = function(x, y, w, h, c) {
	colors.reset();

	this.screen.goto(x, y);

	for (var dy = 0; dy < h; dy++) {
		this.screen.print(new Array(w + 1).join(c || " "));
		this.screen.goto(x, y + dy);
	}

	this.screen.goto(0, 0);
}

module.exports = StudioGraphics;