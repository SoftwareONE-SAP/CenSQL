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
	this.overlappedLinesCount = 0;

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

	this.debouncedDraw = _.throttle(this.draw.bind(this), 50);
}

StudioSqlConsole.prototype.setRegion = function(x, y, w, h) {
	this.region = {
		x: x,
		y: y,
		w: w,
		h: h
	};

	this.moveCursor(-Infinity, -Infinity);
}

StudioSqlConsole.prototype.type = function(s) {

	var cs = s.split("");

	cs.forEach(function(c) {

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

		this.checkScroll(false);

	}.bind(this));

	this.debouncedDraw(false);
}

StudioSqlConsole.prototype.backspace = function() {
	if (this.cursor.x > 0) {
		this.screen.goto((this.content[this.cursor.y].length - 1 > 0 ? this.content[this.cursor.y].length - 1 : 0) + this.region.x, this.cursor.y + this.region.y)
		this.screen.print(this.fillChar[this.bg][this.unfocusedFg]);

		this.content[this.cursor.y] = this.content[this.cursor.y].slice(0, this.cursor.x - 1) + this.content[this.cursor.y].slice(this.cursor.x)

		this.draw(false);

		this.moveCursor(-1, 0, true)
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

StudioSqlConsole.prototype.deleteChar = function() {

	if (this.content[this.cursor.y].length > 0) {

		this.screen.goto((this.content[this.cursor.y].length - 1 > 0 ? this.content[this.cursor.y].length - 1 : 0) + this.region.x, this.cursor.y + this.region.y)

		this.screen.print(this.fillChar[this.bg][this.unfocusedFg]);

		this.gotoCursor();

		this.content[this.cursor.y] = this.content[this.cursor.y].slice(0, this.cursor.x) + this.content[this.cursor.y].slice(this.cursor.x + 1)

		this.draw(false);

	} else if (this.cursor.y !== this.content.length - 1) {
		this.content.splice(this.cursor.y, 1);
		this.draw(true);
	}
}

StudioSqlConsole.prototype.setContent = function(value) {
	this.content = value;
	this.draw(true);
}

StudioSqlConsole.prototype.draw = function(forceBackground) {
	var output = []

	this.overlappedLinesCount = 0;

	for (var i = 0; i < this.content.length; i++) {
		if (!this.content[i]) {
			output.push("");
			continue;
		}

		var lines = this.content[i].match(new RegExp('.{1,' + this.region.w + '}', 'g'));

		if (lines.length > 1) {
			this.overlappedLinesCount++;
		}

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

		var builtLine = "";

		var chars = line.split("");

		var comment = false;

		for (var k = 0; k < chars.length; k++) {

			if(chars[k] == "-" && k < chars.length - 1 && chars[k+1] == "-"){
				comment = true;
			}

			if(!comment){
				builtLine += chars[k][this.fg];
			}else{
				builtLine += chars[k][this.fg].dim;
			}
		}

		var styledLine = builtLine[this.bg];

		this.screen.print(styledLine)
	}

	this.gotoCursor();

	this.contentHeight = output.length;
}

StudioSqlConsole.prototype.gotoCursor = function() {
	
	var heightPadding = 0;

	for (var i = 0; i <= Math.min(this.cursor.y, this.content.length - 1); i++) {

		if(typeof this.content[i] === "undefined") continue;

		heightPadding += Math.floor(this.content[i].length / this.region.w);
	}

	this.screen.goto(this.region.x + ((Math.max((!!this.content[this.cursor.y] ? this.content[this.cursor.y].length : 0) - this.region.w, this.cursor.x) % (this.region.w))), this.region.y + this.cursor.y - this.scroll + heightPadding);
}

StudioSqlConsole.prototype.moveCursor = function(dx, dy, shouldDraw) {

	if (dx == null) {
		dx = 0;
	}

	if (dy == null) {
		dy = 0;
	}

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

	this.checkScroll(shouldDraw);

	this.gotoCursor();
}

StudioSqlConsole.prototype.checkScroll = function(shouldDraw) {
	if (this.cursor.y - this.scroll > this.region.h - 3) {
		this.scroll = this.cursor.y - this.region.h + 3;

		shouldDraw ? this.draw(true) : false;
	}

	if (this.cursor.y - this.scroll <= -1) {
		this.scroll = (this.cursor.y >= 0 ? this.cursor.y : 0);

		shouldDraw ? this.draw(true) : false;
	}
}

StudioSqlConsole.prototype.moveScroll = function(dy) {
	this.scroll += dy;

	this.moveCursor(0, dy, false);

	if (this.scroll < 0) {
		this.scroll = 0;
	}

	this.draw(true);
}

StudioSqlConsole.prototype.clear = function() {
	this.content = [""];
	this.cursor.x = 0;
	this.cursor.y = 0;

	this.draw(true);
}

StudioSqlConsole.prototype.getQuery = function() {
	var query = "";

	for (var i = 0; i < this.content.length; i++) {
		query += this.content[i].substring(0, (this.content[i].indexOf("--") >= 0 ? this.content[i].indexOf("--") : Infinity))
	}

	return query;
}

module.exports = StudioSqlConsole;