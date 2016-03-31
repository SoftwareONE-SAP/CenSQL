var charm = require('charm')(process.stdout);
var colors = require("colors");
var _ = require('lodash');
var pad = require('pad');

var StudioFormatter = function(screen) {
	this.screen = screen;

	this.maxSideWidth = 45;

	this.calculateSize();

	this.refreshCheckDelay = 200;

	this.borderTheme = "bgWhite"
	this.sideBackgroundTheme = "bgBlue";
	this.sideBackgroundActive = "bgWhite";
	this.bottomBarTheme = 'bgBlack'
}

StudioFormatter.prototype.init = function(schemas, tables) {
	this.schemas = schemas;
	this.tables = tables;

	this.redraw();

	setTimeout(this.checkRefresh.bind(this), this.refreshCheckDelay);
}

StudioFormatter.prototype.calculateSize = function() {
	this.width = process.stdout.columns;
	this.height = process.stdout.rows;
	this.sideWidth = (parseInt(this.width / 4) < this.maxSideWidth ? parseInt(this.width / 4) : this.maxSideWidth);
	this.schemaBoxHeight = parseInt(this.height / 3) - 2;
	this.tableBoxHeight = (this.height - this.schemaBoxHeight) - 3
}

StudioFormatter.prototype.checkRefresh = function() {

	if (this.width != process.stdout.columns || this.height != process.stdout.rows) {

		/**
		 * Regenerate size
		 */
		this.calculateSize();

		this.redraw();
	}

	setTimeout(this.checkRefresh.bind(this), this.refreshCheckDelay)
}

StudioFormatter.prototype.redraw = function() {
	this.screen.clear();
	this.drawBorder();
	this.drawSchemaList()
	this.drawTableList();
}

StudioFormatter.prototype.drawSchemaList = function() {

	if (this.schemas.length == 0) {
		return;
	}

	try {

		var yoffset = 2;

		for (var i = 0; i < Math.floor(this.schemaBoxHeight / 2); i++) {
			var name = pad(this.schemas[i % this.schemas.length].SCHEMA_NAME.substring(0, this.sideWidth - 3), this.sideWidth - 3);

			if (i == 0) {
				this.drawText(2, yoffset + i + Math.floor(this.schemaBoxHeight / 2), (" " + name)[this.sideBackgroundTheme].bold)
			} else {
				this.drawText(2, yoffset + i + Math.floor(this.schemaBoxHeight / 2), (" " + name)[this.sideBackgroundTheme])
			}
		}

		for (var i = Math.floor(this.schemaBoxHeight / 2); i > 0; i--) {
			var name = pad(this.schemas[this.schemas.length - (i % this.schemas.length)].SCHEMA_NAME.substring(0, this.sideWidth - 3), this.sideWidth - 3);

			if (i == 0) {
				this.drawText(2, yoffset + Math.floor(this.schemaBoxHeight / 2) - i, (" " + name)[this.sideBackgroundTheme].bold)
			} else {
				this.drawText(2, yoffset + Math.floor(this.schemaBoxHeight / 2) - i, (" " + name)[this.sideBackgroundTheme])
			}
		}

	} catch (e) {
		console.log(e);
	}
}

StudioFormatter.prototype.drawTableList = function() {

	if (this.tables.length == 0) {
		return;
	}

	try {
		var yoffset = 4 + this.schemaBoxHeight;

		for (var i = 0; i < Math.floor(this.tableBoxHeight / 2); i++) {

			var name = pad(this.tables[i % this.tables.length].TABLE_NAME.substring(0, this.sideWidth - 3), this.sideWidth - 3);

			if (i == 0) {
				this.drawText(2, yoffset + i + Math.floor(this.tableBoxHeight / 2), (" " + name)[this.sideBackgroundTheme].bold)
			} else {
				this.drawText(2, yoffset + i + Math.floor(this.tableBoxHeight / 2), (" " + name)[this.sideBackgroundTheme])
			}
		}

		for (var i = Math.ceil(this.tableBoxHeight / 2); i > 0; i--) {

			var name = pad(this.tables[this.tables.length - ((i - 1) % this.tables.length) - 1].TABLE_NAME.substring(0, this.sideWidth - 3), this.sideWidth - 3);

			if (i == 0) {
				this.drawText(2, yoffset + Math.floor(this.tableBoxHeight / 2) - i, (" " + name)[this.sideBackgroundTheme].bold)
			} else {
				this.drawText(2, yoffset + Math.floor(this.tableBoxHeight / 2) - i, (" " + name)[this.sideBackgroundTheme])
			}
		}
	} catch (e) {
		console.log(e);
		// console.log(this.tables)
	}
}

StudioFormatter.prototype.drawBorder = function() {

	/**
	 * Draw outer border
	 */
	this.drawBox(1, 1, this.width, 1, " " [this.borderTheme]);
	this.drawBox(1, this.height, this.width, 1, " " [this.borderTheme]);

	this.drawBox(1, 2, 1, this.height - 1, " " [this.borderTheme]);
	this.drawBox(this.width, 2, 1, this.height - 1, " " [this.borderTheme]);

	/**
	 * Draw sideline
	 */
	this.drawBox(this.sideWidth, 2, 1, this.height - 1, " " [this.borderTheme]);

	/**
	 * Draw sideBox
	 */
	this.drawBox(2, 2, this.sideWidth - 2, this.height - 1, " " [this.sideBackgroundTheme]);

	/**
	 * Draw side box divider
	 */
	this.drawBox(2, this.schemaBoxHeight + 2, this.sideWidth - 2, 1, " " [this.borderTheme]);

	/**
	 * Draw bottom help bar
	 */
	this.drawBox(this.sideWidth + 1, this.height, this.width - this.sideWidth - 1, 2, " " [this.bottomBarTheme]);
	this.drawText(this.sideWidth + 1, this.height, "Help" [this.bottomBarTheme]);

}

StudioFormatter.prototype.drawText = function(x, y, t) {
	this.screen.goto(x, y);
	this.screen.print(t);
	this.screen.goto(0, 0);
}

StudioFormatter.prototype.drawBox = function(x, y, w, h, c) {

	this.screen.goto(x, y);

	for (var dy = 0; dy < h; dy++) {
		for (var dx = 0; dx < w; dx++) {
			this.screen.print(c);
		}
		this.screen.goto(x, y + dy);
	}

	// this.screen.goto(1, 1);
}

StudioFormatter.prototype.byebye = function() {
	this.screen.print("\n");
	this.screen.clear()
	this.screen.print(colors.green("Bye Bye!"), false)
	this.screen.print("\n");
}

StudioFormatter.prototype.rotateSchemas = function(d) {

	if(this.schemas.length == 0){
		return;
	}

	for (var i = 0; i < Math.abs(d); i++) {

		if (d < 0) {
			this.schemas.unshift(this.schemas.pop());
		}

		if (d > 0) {
			this.schemas.push(this.schemas.shift());
		}
	}

	this.drawSchemaList();
}

StudioFormatter.prototype.rotateTables = function(d) {

	if(this.tables.length == 0){
		return;
	}

	for (var i = 0; i < Math.abs(d); i++) {

		if (d < 0) {
			this.tables.unshift(this.tables.pop());
		}

		if (d > 0) {
			this.tables.push(this.tables.shift());
		}
	}

	this.drawTableList();
}

StudioFormatter.prototype.setTables = function(tables){
	this.tables = tables;
	this.drawTableList();
}

StudioFormatter.prototype.setSchemas = function(schemas){
	this.schemas = schemas;
	this.drawSchemaList();
}

module.exports = StudioFormatter;