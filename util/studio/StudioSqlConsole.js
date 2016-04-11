var async = require("async");
var _ = require('lodash');

var StudioSqlConsole = function(screen, dbHandler) {
	this.screen = screen;
	this.dbHandler = dbHandler;

	this.fillChar = "."

	this.fg = "white";
	this.bg = "bgBlack";

	this.keyWordFormat = "bold";
	this.keyWordColor = "cyan";

	this.unfocusedFg = "grey"

	this.init();
}

StudioSqlConsole.prototype.init = function() {
	this.content = [""];
	this.contentHeight = -1;

	this.scroll = 0;

	this.cursor = {
		x: 0,
		y: 0
	}

	this.region = {
		x: 0,
		y: 0,
		w: 1,
		h: 1
	}

	this.setContent([
		"Wiffle",
		"Woffle",
		"Wiffle",
		"Woffle",
		"Wiffle",
		"Woffle",
		"Wiffle",
		"Woffle",
		"Wiffle",
		"Woffle",
		"Oh no! D:"
	])

}

StudioSqlConsole.prototype.setRegion = function(x, y, w, h) {
	this.region = {
		x: x,
		y: y,
		w: w,
		h: h
	}

	this.draw();
}

StudioSqlConsole.prototype.type = function(c) {

	if (c == "\n" || c == "\r") {

		this.content.splice(this.cursor.y + 1, 0, "");

		var endLine = (this.content[this.cursor.y] ? this.content[this.cursor.y].substring(this.cursor.x) : "");

		this.content[this.cursor.y] = (this.content[this.cursor.y] ? this.content[this.cursor.y].substring(0, this.cursor.x) : "");

		this.cursor.y++;

		this.content[this.cursor.y] = endLine;

		this.cursor.x = 0;

	} else {

		if (!this.content[this.cursor.y]) {
			this.content[this.cursor.y] = "";
		}

		this.content[this.cursor.y] = this.content[this.cursor.y].slice(0, this.cursor.x) + c + this.content[this.cursor.y].slice(this.cursor.x);

		this.cursor.x++;
	}


	this.draw(false);
}

StudioSqlConsole.prototype.backspace = function() {
	if (this.cursor.x > 0) {
		this.screen.goto((this.content[this.cursor.y].length - 1 > 0 ? this.content[this.cursor.y].length - 1 : 0) + this.region.x, this.cursor.y + this.region.y)
		this.screen.print(this.fillChar[this.bg][this.unfocusedFg]);

		this.content[this.cursor.y] = this.content[this.cursor.y].slice(0, this.cursor.x - 1) + this.content[this.cursor.y].slice(this.cursor.x)

		this.moveCursor(-1, 0)

		this.draw(false)
		return;
	}

	/**
	 * Back up a line
	 */
	if (this.cursor.y > 0) {

		this.cursor.x = (this.content[this.cursor.y - 1] ? this.content[this.cursor.y - 1].length : 0);

		this.content[this.cursor.y - 1] = (this.content[this.cursor.y - 1] ? this.content[this.cursor.y - 1] : "") + (this.content[this.cursor.y] ? this.content[this.cursor.y] : "");
		this.content.splice(this.cursor.y, 1);

		this.cursor.y--;

		this.draw(true);
	}

}

StudioSqlConsole.prototype.setContent = function(value) {
	this.content = value;
	this.draw(true);
}

StudioSqlConsole.prototype.draw = function(forceBackground) {
	var output = []

	for (var i = 0; i < this.content.length; i++) {
		if (!this.content[i]) {
			output.push("");
			continue;
		}

		var lines = this.content[i].match(new RegExp('.{1,' + this.region.w + '}', 'g'));

		output = output.concat(lines);
	}

	this.checkScroll(false);

	if (forceBackground || this.contentHeight !== output.length) {
		this.screen.graphics.drawBox(this.region.x, this.region.y, this.region.w, this.region.h - 1, this.fillChar[this.unfocusedFg][this.bg]);
	}

	for (var i = 0; i < this.region.h - 2; i++) {
		this.screen.goto(this.region.x, this.region.y + i);

		var line = (output[i + this.scroll] ? output[i + this.scroll] : "");

		if (line == null) {
			line = ""
		}

		this.screen.print(line[this.fg][this.bg])
	}

	this.gotoCursor();

	this.contentHeight = output.length;
}

StudioSqlConsole.prototype.gotoCursor = function() {
	this.screen.goto(this.region.x + this.cursor.x, this.region.y + this.cursor.y - this.scroll);
}

StudioSqlConsole.prototype.moveCursor = function(dx, dy) {

	this.cursor.x += dx;
	this.cursor.y += dy;

	if (this.cursor.x < 0) {
		this.cursor.x = 0;
	}

	if (this.cursor.y < 0) {
		this.cursor.y = 0;
	}

	if (this.content[this.cursor.y]) {

		if (this.cursor.x > this.content[this.cursor.y].length) {
			this.cursor.x = this.content[this.cursor.y].length || 0
		}
	} else {
		this.cursor.x = 0;
	}

	this.checkScroll(true);

	this.gotoCursor();
}

StudioSqlConsole.prototype.checkScroll = function(shouldDraw){
	if (this.cursor.y - this.scroll > this.region.h - 3) {
		this.scroll = this.cursor.y - this.region.h + 3;
		
		shouldDraw ? this.draw(true) : false;
	}

	if (this.cursor.y - this.scroll <= -1) {
		this.scroll = (this.cursor.y >= 0 ? this.cursor.y : 0);
		
		shouldDraw ? this.draw(true) : false;
	}
}

module.exports = StudioSqlConsole;