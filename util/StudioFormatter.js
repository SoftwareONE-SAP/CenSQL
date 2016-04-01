var charm = require('charm')(process.stdout);
var colors = require("colors");
var _ = require('lodash');
var pad = require('pad');

var StudioFormatter = function(screen) {
	this.screen = screen;

	this.maxSideWidth = 45;

	this.calculateSize();

	this.refreshCheckDelay = 150;

	this.tableListMode = "Tables";

	this.borderTheme = "bgWhite"
	this.sideBackgroundTheme = "bgCyan";
	this.bottomBarTheme = 'bgBlack'
	this.tableBoxBackgroundTheme = {
		"Tables": "bgBlue",
		"Views": "bgRed"
	};
}

StudioFormatter.prototype.init = function(schemas, tables) {
	this.schemas = schemas;
	this.tables = tables;

	this.redraw();

	setTimeout(this.checkRefresh.bind(this), this.refreshCheckDelay);
}

StudioFormatter.prototype.calculateSize = function() {
	this.width = process.stdout.columns;
	this.height = process.stdout.rows - 2;
	this.sideWidth = (Math.ceil(this.width / 4) < this.maxSideWidth ? Math.ceil(this.width / 4) : this.maxSideWidth);
	this.schemaBoxHeight = Math.ceil(this.height / 4);
	this.tableBoxHeight = this.height - this.schemaBoxHeight - 5
}

StudioFormatter.prototype.checkRefresh = function() {

	if (this.width != process.stdout.columns || this.height != process.stdout.rows - 2) {

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

	// console.log(this.schemaBoxHeight)

	try {

		var yoffset = 3;

		for (var i = 0; i < Math.ceil(this.schemaBoxHeight / 2); i++) {
			var name = pad(this.schemas[i % this.schemas.length].SCHEMA_NAME.substring(0, this.sideWidth - 4), this.sideWidth - 3);

			if (i == 0) {
				this.drawText(2, yoffset + i + parseInt(this.schemaBoxHeight / 2), (" " + name)[this.sideBackgroundTheme].bold)
			} else {
				this.drawText(2, yoffset + i + parseInt(this.schemaBoxHeight / 2), (" " + name)[this.sideBackgroundTheme])
			}
		}

		for (var i = Math.floor(this.schemaBoxHeight / 2); i > 0; i--) {
			var name = pad(this.schemas[this.schemas.length - (i % this.schemas.length)].SCHEMA_NAME.substring(0, this.sideWidth - 4), this.sideWidth - 3);

			if (i == 0) {
				this.drawText(2, yoffset + parseInt(this.schemaBoxHeight / 2) - i, (" " + name)[this.sideBackgroundTheme].bold)
			} else {
				this.drawText(2, yoffset + parseInt(this.schemaBoxHeight / 2) - i, (" " + name)[this.sideBackgroundTheme])
			}
		}

	} catch (e) {
		console.log(e);
	}
}

StudioFormatter.prototype.drawTableList = function() {

	if (this.tables.length == 0) {
		this.drawBox(2, this.schemaBoxHeight + 5, this.sideWidth - 2, this.tableBoxHeight + 1, " " [this.tableBoxBackgroundTheme[this.tableListMode]]);
		return;
	}

	try {
		var yoffset = 5 + this.schemaBoxHeight;

		for (var i = 0; i < Math.ceil(this.tableBoxHeight / 2); i++) {

			var name = pad(this.tables[i % this.tables.length].NAME.substring(0, this.sideWidth - 4), this.sideWidth - 3);

			if (i == 0) {
				this.drawText(2, yoffset + i + parseInt(this.tableBoxHeight / 2), (" " + name)[this.tableBoxBackgroundTheme[this.tableListMode]].bold)
			} else {
				this.drawText(2, yoffset + i + parseInt(this.tableBoxHeight / 2), (" " + name)[this.tableBoxBackgroundTheme[this.tableListMode]])
			}
		}

		for (var i = Math.floor(this.tableBoxHeight / 2); i > 0; i--) {

			var name = pad(this.tables[this.tables.length - ((i - 1) % this.tables.length) - 1].NAME.substring(0, this.sideWidth - 4), this.sideWidth - 3);

			if (i == 0) {
				this.drawText(2, yoffset + parseInt(this.tableBoxHeight / 2) - i, (" " + name)[this.tableBoxBackgroundTheme[this.tableListMode]].bold)
			} else {
				this.drawText(2, yoffset + parseInt(this.tableBoxHeight / 2) - i, (" " + name)[this.tableBoxBackgroundTheme[this.tableListMode]])
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

	this.drawBox(1, 2, 1, this.height, " " [this.borderTheme]);
	this.drawBox(this.width, 2, 1, this.height, " " [this.borderTheme]);

	/**
	 * Draw sideline
	 */
	this.drawBox(this.sideWidth, 2, 1, this.height, " " [this.borderTheme]);

	/**
	 * Draw side box divider
	 */
	this.drawBox(2, this.schemaBoxHeight + 3, this.sideWidth - 2, 1, " " [this.borderTheme]);

	/**
	 * Draw side headers
	 */
	this.drawText(2, 2, colors.bgBlack(pad(" Schemas", this.sideWidth - 2)));

	this.drawTableBoxHeader();

	/**
	 * Draw bottom help bar
	 */
	this.drawHelpText();

}

StudioFormatter.prototype.drawHelpText = function() {
	this.drawBox(1, this.height + 1, this.width, 3, " " [this.bottomBarTheme]);

	this.drawText(2, this.height + 1, colors.bgBlack.bold("Shft + ▲/▼") + " scroll schemas." [this.bottomBarTheme]);
	this.drawText(2, this.height + 2, colors.bgBlack.bold("Ctrl + ▲/▼") + " scroll tables" [this.bottomBarTheme]);

	this.drawText(29, this.height + 1, colors.bgBlack.bold("Shft + ⯈") + " select schema." [this.bottomBarTheme]);
	this.drawText(29, this.height + 2, colors.bgBlack.bold("Ctrl + ⯈") + " select table." [this.bottomBarTheme]);

	this.drawText(53, this.height + 1, colors.bgBlack.bold("Shft + Tab") + " toggle between tables/views." [this.bottomBarTheme]);

}

StudioFormatter.prototype.drawTableBoxHeader = function() {
	this.drawText(2, this.schemaBoxHeight + 4, colors.bgBlack(pad(" " + this.tableListMode, this.sideWidth - 2)));
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

StudioFormatter.prototype.drawTableView = function(schema, table, columns, dataPreview) {
	console.log("yay!")
}

StudioFormatter.prototype.fullPageError = function(err) {
	this.drawBox(this.sideWidth + 1, 2, this.width - this.sideWidth - 1, this.height - 1, " ");

	var s = "" + err;

	var width = parseInt((this.width - this.sideWidth) * 0.50);

	var stringCutdown = (s).match(new RegExp(".{1," + (width - 3) + "}", "g"));

	if(stringCutdown.length == 1){
		width = stringCutdown[0].length + 3
	}

	var height = stringCutdown.length + 3;
	var ypos = (this.height / 2) - (this.height / (this.height / height));
	var xpos = parseInt(this.sideWidth + (((this.width - this.sideWidth) / 2)- (width / 2)));

	this.drawBox(xpos - 1, ypos + 1, width, height, " " ["bgBlack"]);
	this.drawBox(xpos, ypos, width, height, " " ["bgRed"]);

	for (var i = stringCutdown.length - 1; i >= 0; i--) {
		this.drawText(xpos + 2, ypos + 1 + i, stringCutdown[i].bgRed.bold);
	}

}

StudioFormatter.prototype.byebye = function() {
	this.screen.print("\n");
	this.screen.clear()
	this.screen.print(colors.green("Bye Bye!"), false)
	this.screen.print("\n");
}

StudioFormatter.prototype.rotateSchemas = function(d) {

	if (this.schemas.length == 0) {
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

	if (this.tables.length == 0) {
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

StudioFormatter.prototype.setTables = function(tables) {
	this.tables = tables;
	this.drawTableList();
}

StudioFormatter.prototype.setSchemas = function(schemas) {
	this.schemas = schemas;
	this.drawSchemaList();
}

StudioFormatter.prototype.setTableListMode = function(mode) {
	this.tableListMode = mode;
	this.drawTableBoxHeader();
}

module.exports = StudioFormatter;