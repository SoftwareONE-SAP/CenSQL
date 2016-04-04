var charm = require('charm')(process.stdout);
var colors = require("colors");
var _ = require('lodash');
var pad = require('pad');
var cliTable = require('cli-table');
var stripColorCodes = require('stripcolorcodes');

var StudioFormatter = function(screen) {
	this.screen = screen;

	this.maxSideWidth = 45;
	this.refreshCheckDelay = 150;

	this.calculateSize();

	this.tableListMode = "Tables";

	this.borderTheme = "bgWhite"
	this.sideBackgroundTheme = "bgCyan";
	this.bottomBarTheme = 'bgBlack'
	this.tableBoxBackgroundTheme = {
		"Tables": "bgBlue",
		"Views": "bgMagenta"
	};

	this.scrollDataPaneDebounced = _.throttle(this.scrollDataPane.bind(this), 80, {leading: true});
}

StudioFormatter.prototype.init = function(schemas, tables) {
	this.schemas = schemas;
	this.tables = tables;

	this.dataPane = {
		scroll: {
			x: 0,
			y: 0
		}
	};

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
	this.redrawDataPane();
}

StudioFormatter.prototype.redrawDataPane = function() {
	if (this.dataPane.mode == "tablePreview") {
		this.drawTableMetaInfo();
		this.drawDataView();
	}
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

StudioFormatter.prototype.clearMainPanel = function() {
	this.drawBox(this.sideWidth + 1, 2, this.width - this.sideWidth - 1, this.height - 1, " ");
}

StudioFormatter.prototype.drawTableView = function(schema, table, columns, dataPreview, isView) {

	var colNames = [];

	for (var i = columns.length - 1; i >= 0; i--) {
		colNames.push(columns[i].COLUMN_NAME)
	}

	/**
	 * Save this state
	 */
	this.dataPane.mode = "tablePreview"

	this.dataPane.meta = {
		schema: schema,
		table: table,
		columns: colNames,
		isView: isView
	}

	this.dataPane.data = dataPreview;

	this.dataPane.scroll = {
		x: 0,
		y: 0
	}

	this.redrawDataPane();
}

StudioFormatter.prototype.drawDataView = function() {
	if (!this.dataPane.data || this.dataPane.data.length == 0) {
		this.fullPageError("Nothing to show", "bgBlue", true);
		return;
	}

	var table = new cliTable({
		head: this.dataPane.meta.columns
	});

	for (var k = 0; k < this.dataPane.data.length; k++) {
		var rows = [];

		for (var j = 0; j < this.dataPane.meta.columns.length; j++) {

			var value = this.dataPane.data[k][this.dataPane.meta.columns[j]];

			if (value == null) value = "NULL";

			rows.push(value)
		};

		table.push(rows);
	};

	var rows = table.toString().split("\n");

	var yPadding = 7;

	var x = 0;
	var y = 0;

	var awidth = this.width - this.sideWidth - 2;
	var aheight = this.height - 7;

	var count =- 0;

	/**
	 * Draw table
	 */
	for (var i = this.dataPane.scroll.y; i < aheight + this.dataPane.scroll.y; i++) {

		if (i + 1 > rows.length) {
			continue;
		}

		count++;

		var line = stripColorCodes(rows[i]).substring(x + this.dataPane.scroll.x, x + awidth + this.dataPane.scroll.x);

		line = pad(line, awidth, " ")

		this.drawText(this.sideWidth + 1, yPadding + i - this.dataPane.scroll.y, line)
	}

	for (var i = count; i < aheight; i++) {
		this.drawText(this.sideWidth + 1, yPadding + i, pad("-", awidth, " "))
	}
}

StudioFormatter.prototype.drawTableMetaInfo = function() {

	this.clearMainPanel();

	var height = 4;
	var xoffset = 2;

	var columnString = this.dataPane.meta.columns.join(", ");

	var maxColumnStringWidth = this.width - this.sideWidth - 13;

	if (columnString.length > maxColumnStringWidth) {
		columnString = columnString.substring(0, maxColumnStringWidth - 3) + "..."
	}

	/**
	 * Draw meta box
	 */
	this.drawBox(this.sideWidth + 1, 2, this.width - this.sideWidth - 1, height + 1, " ".bgBlack);
	this.drawBox(this.sideWidth + 1, height + 2, this.width - this.sideWidth - 1, 1, " " [this.borderTheme]);

	this.drawText(this.sideWidth + xoffset, 3, "Schema Name: ".bold.bgBlack + this.dataPane.meta.schema.substring(0, 23)['bgBlack'])

	if (this.dataPane.meta.isView) {
		this.drawText(this.sideWidth + xoffset + 39, 3, "View Name: ".bold.bgBlack + this.dataPane.meta.table.substring(0, 25)['bgBlack'])
	} else {
		this.drawText(this.sideWidth + xoffset + 39, 3, "Table Name: ".bold.bgBlack + this.dataPane.meta.table.substring(0, 25)['bgBlack'])
	}

	this.drawText(this.sideWidth + xoffset, 4, "Columns: ".bold.bgBlack + columnString['bgBlack'])
}

StudioFormatter.prototype.fullPageError = function(err, colour, shouldClear) {
	if (!shouldClear) {
		this.clearMainPanel();
	}

	if (!colour) {
		colour = "bgRed"
	}

	var s = "" + err;

	var width = parseInt((this.width - this.sideWidth) * 0.50);

	var stringCutdown = (s).match(new RegExp(".{1," + (width - 3) + "}", "g"));

	if (stringCutdown.length == 1) {
		width = stringCutdown[0].length + 3
	}

	var height = stringCutdown.length + 3;
	var ypos = (this.height / 2) - (this.height / (this.height / height));
	var xpos = parseInt(this.sideWidth + (((this.width - this.sideWidth) / 2) - (width / 2)));

	this.drawBox(xpos - 1, ypos + 1, width, height, " " ["bgBlack"]);
	this.drawBox(xpos, ypos, width, height, " " [colour]);

	for (var i = stringCutdown.length - 1; i >= 0; i--) {
		this.drawText(xpos + 2, ypos + 1 + i, stringCutdown[i][colour].bold);
	}

}

StudioFormatter.prototype.byebye = function() {
	this.screen.print("\n");
	this.screen.clear()
	this.screen.print(colors.green("Bye Bye!"), false)
	this.screen.print("\n");
}

StudioFormatter.prototype.scrollDataPane = function(dx, dy) {
	var oldx = this.dataPane.scroll.x;
	var oldy = this.dataPane.scroll.y;

	this.dataPane.scroll.x += dx;
	this.dataPane.scroll.y += dy;

	if(this.dataPane.scroll.x < 0){
		this.dataPane.scroll.x = 0;
	}

	if(this.dataPane.scroll.y < 0){
		this.dataPane.scroll.y = 0;
	}

	if(oldx != this.dataPane.scroll.x || oldy != this.dataPane.scroll.y){
		this.drawDataView();
	}
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