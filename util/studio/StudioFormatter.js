var charm = require('charm')(process.stdout);
var colors = require("colors");
var _ = require('lodash');
var pad = require('pad');
var cliTable = require('cli-table');
var stripColorCodes = require('stripcolorcodes');
var ansiSubstr = require('ansi-substring');
var async = require('async');

var StudioFormatter = function(session, screen, sqlConsole) {
	this.session = session;
	this.screen = screen;
	this.sqlConsole = sqlConsole;

	this.maxSideWidth = 45;
	this.maxSqlConsoleHeight = 15;
	this.metaBoxHeight = 4;

	this.refreshCheckDelay = 150;

	this.tableListMode = "Tables";

	this.borderTheme = "bgWhite"
	this.sideBackgroundTheme = "bgCyan";
	this.bottomBarTheme = 'bgBlack'
	this.metaBoxTheme = "bgMagenta"
	this.tableBoxBackgroundTheme = {
		"Tables": "bgBlue",
		"Views": "bgMagenta"
	};

	this.scrollDataPaneDebounced = _.throttle(this.scrollDataPane.bind(this), 70, {
		trailing: true
	});
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

	this.calculateSize();

	this.redraw();

	setTimeout(this.checkRefresh.bind(this), this.refreshCheckDelay);
}

StudioFormatter.prototype.calculateSize = function() {
	this.width = process.stdout.columns || 80;
	this.height = (process.stdout.rows || 30) - 2;
	this.sideWidth = (Math.ceil(this.width / 4) < this.maxSideWidth ? Math.ceil(this.width / 4) : this.maxSideWidth);
	this.schemaBoxHeight = Math.ceil(this.height / 4);
	this.tableBoxHeight = this.height - this.schemaBoxHeight - 5
	this.sqlConsoleHeight = (Math.ceil(this.height / 5) < this.maxSqlConsoleHeight ? Math.ceil(this.height / 5) : this.maxSqlConsoleHeight);
	this.dataPaneHeight = this.height - this.sqlConsoleHeight;
	this.metaWindowHeight = 6;

	this.sqlConsole.setRegion(
		this.sideWidth + 1,
		this.dataPaneHeight + 2,
		this.width - this.sideWidth - 1,
		this.sqlConsoleHeight
	)

	GLOBAL.graphWidth = process.stdout.columns / 1.5;
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
	this.drawHelpText();
	this.drawSchemaList()
	this.drawTableList();
	this.redrawDataPane();
	this.sqlConsole.draw(true);
}

StudioFormatter.prototype.redrawDataPane = function() {
	if (this.dataPane.mode == "tablePreview") {
		this.drawTableMetaInfo();
		this.drawActiveBorders();
		this.drawDataView();
	}

	if (this.dataPane.mode == "queryOutput") {
		this.clearMainPanel();
		this.drawQueryHeader();
		this.drawActiveBorders();
		this.drawDataView();
	}

	this.sqlConsole.moveCursor();
}

StudioFormatter.prototype.drawQueryHeader = function(){
	/**
	 * Draw meta box
	 */
	this.screen.graphics.drawBox(this.sideWidth + 1, 2, this.width - this.sideWidth - 1, this.metaBoxHeight + 1, " " [this.metaBoxTheme]);

	this.screen.graphics.drawText(this.sideWidth + 2, 3, "SQL: "[this.metaBoxTheme].bold + this.dataPane.meta.query.substring(0, this.width - this.sideWidth - 8)[this.metaBoxTheme])
}

StudioFormatter.prototype.drawSchemaList = function() {

	if (this.schemas.length == 0) {
		return;
	}

	try {

		var yoffset = 3;

		for (var i = 0; i < Math.ceil(this.schemaBoxHeight / 2); i++) {
			var name = pad(this.schemas[i % this.schemas.length].SCHEMA_NAME.substring(0, this.sideWidth - 4), this.sideWidth - 3);

			if (i == 0) {
				this.screen.graphics.drawText(2, yoffset + i + parseInt(this.schemaBoxHeight / 2), (" " + name)[this.sideBackgroundTheme].bold)
			} else {
				this.screen.graphics.drawText(2, yoffset + i + parseInt(this.schemaBoxHeight / 2), (" " + name)[this.sideBackgroundTheme])
			}
		}

		for (var i = Math.floor(this.schemaBoxHeight / 2); i > 0; i--) {
			var name = pad(this.schemas[this.schemas.length - (i % this.schemas.length)].SCHEMA_NAME.substring(0, this.sideWidth - 4), this.sideWidth - 3);

			if (i == 0) {
				this.screen.graphics.drawText(2, yoffset + parseInt(this.schemaBoxHeight / 2) - i, (" " + name)[this.sideBackgroundTheme].bold)
			} else {
				this.screen.graphics.drawText(2, yoffset + parseInt(this.schemaBoxHeight / 2) - i, (" " + name)[this.sideBackgroundTheme])
			}
		}

	} catch (e) {
		console.log(e);
	}
}

StudioFormatter.prototype.drawTableList = function() {

	if (this.tables.length == 0) {
		this.screen.graphics.drawBox(2, this.schemaBoxHeight + 5, this.sideWidth - 2, this.tableBoxHeight + 1, " " [this.tableBoxBackgroundTheme[this.tableListMode]]);
		return;
	}

	try {
		var yoffset = 5 + this.schemaBoxHeight;

		for (var i = 0; i < Math.ceil(this.tableBoxHeight / 2); i++) {

			var name = pad(this.tables[i % this.tables.length].NAME.substring(0, this.sideWidth - 4), this.sideWidth - 3);

			if (i == 0) {
				this.screen.graphics.drawText(2, yoffset + i + parseInt(this.tableBoxHeight / 2), (" " + name)[this.tableBoxBackgroundTheme[this.tableListMode]].bold)
			} else {
				this.screen.graphics.drawText(2, yoffset + i + parseInt(this.tableBoxHeight / 2), (" " + name)[this.tableBoxBackgroundTheme[this.tableListMode]])
			}
		}

		for (var i = Math.floor(this.tableBoxHeight / 2); i > 0; i--) {

			var name = pad(this.tables[this.tables.length - ((i - 1) % this.tables.length) - 1].NAME.substring(0, this.sideWidth - 4), this.sideWidth - 3);

			if (i == 0) {
				this.screen.graphics.drawText(2, yoffset + parseInt(this.tableBoxHeight / 2) - i, (" " + name)[this.tableBoxBackgroundTheme[this.tableListMode]].bold)
			} else {
				this.screen.graphics.drawText(2, yoffset + parseInt(this.tableBoxHeight / 2) - i, (" " + name)[this.tableBoxBackgroundTheme[this.tableListMode]])
			}
		}
	} catch (e) {
		console.log(e);
	}
}

StudioFormatter.prototype.drawActiveBorders = function() {

	var focusedChar = " ".bgYellow
	var nonfocusedChar = " " [this.borderTheme]

	/**
	 * Shared by both
	 */
	this.screen.graphics.drawBox(this.sideWidth + 1, this.height, this.width - this.sideWidth - 1, 1, (this.session.focus == "sql-console" ? focusedChar : nonfocusedChar));

	/**
	 * Data pane
	 */

	this.screen.graphics.drawBox(this.sideWidth + 1, 1, this.width - this.sideWidth - 1, 1, (this.session.focus == "data-pane" ? focusedChar : nonfocusedChar));
	this.screen.graphics.drawBox(this.sideWidth, 1, 1, this.height - this.sqlConsoleHeight + 1, (this.session.focus == "data-pane" ? focusedChar : nonfocusedChar));
	this.screen.graphics.drawBox(this.width, 1, 1, this.height - this.sqlConsoleHeight + 1, (this.session.focus == "data-pane" ? focusedChar : nonfocusedChar));

	if (this.dataPane.mode == "tablePreview" || this.dataPane.mode == "queryOutput") {
		this.screen.graphics.drawBox(this.sideWidth + 1, this.metaWindowHeight, this.width - this.sideWidth - 1, 1, (this.session.focus == "data-pane" ? focusedChar : nonfocusedChar));
	}

	/**
	 * SQL console
	 */
	this.screen.graphics.drawBox(this.sideWidth, this.dataPaneHeight + 1, this.width - this.sideWidth + 1, 1, focusedChar);

	this.screen.graphics.drawBox(this.sideWidth, this.dataPaneHeight + 2, 1, this.sqlConsoleHeight, (this.session.focus == "sql-console" ? focusedChar : nonfocusedChar));
	this.screen.graphics.drawBox(this.width, this.dataPaneHeight + 2, 1, this.sqlConsoleHeight, (this.session.focus == "sql-console" ? focusedChar : nonfocusedChar));
}

StudioFormatter.prototype.drawHelpText = function() {

	/**
	 * Always draw this help
	 */
	this.screen.graphics.drawBox(1, this.height + 1, this.width, 3, " " [this.bottomBarTheme]);

	this.screen.graphics.drawText(2, this.height + 1, colors.bgBlack.bold("Shft + ⮙ ⮛") + " Scroll schemas." [this.bottomBarTheme]);
	this.screen.graphics.drawText(2, this.height + 2, colors.bgBlack.bold("Ctrl + ⮙ ⮛") + " Scroll tables" [this.bottomBarTheme]);

	this.screen.graphics.drawText(29, this.height + 1, colors.bgBlack.bold("Shft + ⮚") + " Select schema." [this.bottomBarTheme]);
	this.screen.graphics.drawText(29, this.height + 2, colors.bgBlack.bold("Ctrl + ⮚") + " Select table." [this.bottomBarTheme]);

	this.screen.graphics.drawText(53, this.height + 1, colors.bgBlack.bold("Shft + Tab") + "    Toggle between tables/views." [this.bottomBarTheme]);

	/**
	 * Draw this help for datapanes
	 */
	if(this.session.focus == "data-pane"){
		this.screen.graphics.drawText(53, this.height + 2, colors.bgBlack.bold("⮘ / ⮙ / ⮚ / ⮛") + " Scroll data pane" [this.bottomBarTheme]);
	}

	/**
	 * Draw sql console help
	 */
	if(this.session.focus == "sql-console"){
		this.screen.graphics.drawText(53, this.height + 2, colors.bgBlack.bold("Ctrl + Enter") + "  Run query" [this.bottomBarTheme]);
	}
}

StudioFormatter.prototype.drawTableBoxHeader = function() {
	this.screen.graphics.drawText(2, this.schemaBoxHeight + 4, colors.bgBlack(pad(" " + this.tableListMode, this.sideWidth - 2)));
}

StudioFormatter.prototype.drawBorder = function() {

	/**
	 * Draw outer border
	 */
	this.screen.graphics.drawBox(1, 1, this.width, 1, " " [this.borderTheme]);
	this.screen.graphics.drawBox(1, this.height, this.width, 1, " " [this.borderTheme]);

	this.screen.graphics.drawBox(1, 2, 1, this.height, " " [this.borderTheme]);
	this.screen.graphics.drawBox(this.width, 2, 1, this.height, " " [this.borderTheme]);

	/**
	 * Draw side box divider
	 */
	this.screen.graphics.drawBox(2, this.schemaBoxHeight + 3, this.sideWidth - 2, 1, " " [this.borderTheme]);

	/**
	 * Draw side headers
	 */
	this.screen.graphics.drawText(2, 2, colors.bgBlack(pad(" Schemas", this.sideWidth - 2)));

	this.drawTableBoxHeader();

	/** 
	 * Draw active borders
	 */
	this.drawActiveBorders();
}

StudioFormatter.prototype.clearMainPanel = function() {
	this.screen.graphics.drawBox(this.sideWidth + 1, 2, this.width - this.sideWidth - 1, this.dataPaneHeight, " ");
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

	this.dataPane.rawData = dataPreview;

	this.dataPane.scroll = {
		x: 0,
		y: 0
	}

	var table = new cliTable({
		head: this.dataPane.meta.columns
	});

	for (var k = 0; k < this.dataPane.rawData.length; k++) {
		var rows = [];

		for (var j = 0; j < this.dataPane.meta.columns.length; j++) {

			var value = this.dataPane.rawData[k][this.dataPane.meta.columns[j]];

			if (value == null) value = "NULL";

			rows.push(value)
		};

		table.push(rows);
	};

	this.dataPane.data = table.toString().split("\n");

	this.redrawDataPane();
}

StudioFormatter.prototype.drawOueryOutputView = function(query, data) {

	/**
	 * Save this state
	 */
	this.dataPane.mode = "queryOutput"

	this.dataPane.meta = {
		query: query
	}

	this.dataPane.rawData = data;

	this.dataPane.scroll = {
		x: 0,
		y: 0
	}

	this.screen.renderCommandOutput(query, data, function(err, lines){
		this.dataPane.data = [].concat.apply([], lines);

		this.redrawDataPane();
	}.bind(this))

}

StudioFormatter.prototype.drawDataView = function() {
	if (!this.dataPane.rawData || this.dataPane.rawData.length == 0) {
		this.fullPageAlert("Nothing to show", "bgBlue", true);
		return;
	}

	var yPadding = 7;

	var x = 0;
	var y = 0;

	var awidth = this.width - this.sideWidth - 1;
	var aheight = this.dataPaneHeight - this.metaWindowHeight;

	var count = -0;

	/**
	 * Draw table
	 */
	for (var i = this.dataPane.scroll.y; i < aheight + this.dataPane.scroll.y; i++) {

		if (i + 1 > this.dataPane.data.length) {
			break;
		}

		count++;

		var line = this.dataPane.data[i]

		line = line.replace(new RegExp("\\t", 'g'), "    ").trim();

		line = ansiSubstr(line, x + this.dataPane.scroll.x, x + awidth + this.dataPane.scroll.x);

		line = pad(line, awidth, {
			colors: true,
			char: " "
		});

		this.screen.graphics.drawText(this.sideWidth + 1, yPadding + i - this.dataPane.scroll.y, line)
	}

	for (var i = count; i < aheight; i++) {
		this.screen.graphics.drawText(this.sideWidth + 1, yPadding + i, pad("-", awidth, " "))
	}
}

StudioFormatter.prototype.drawTableMetaInfo = function() {

	this.clearMainPanel();

	var xoffset = 2;

	var columnString = this.dataPane.meta.columns.join(", ");

	var maxColumnStringWidth = this.width - this.sideWidth - 13;

	if (columnString.length > maxColumnStringWidth) {
		columnString = columnString.substring(0, maxColumnStringWidth - 3) + "..."
	}

	/**
	 * Draw meta box
	 */
	this.screen.graphics.drawBox(this.sideWidth + 1, 2, this.width - this.sideWidth - 1, this.metaBoxHeight + 1, " " [this.metaBoxTheme]);

	this.screen.graphics.drawText(this.sideWidth + xoffset, 3, "Schema Name: ".bold[this.metaBoxTheme] + this.dataPane.meta.schema.substring(0, 23)[this.metaBoxTheme])

	if (this.dataPane.meta.isView) {
		this.screen.graphics.drawText(this.sideWidth + xoffset + 39, 3, "View Name: ".bold[this.metaBoxTheme] + this.dataPane.meta.table.substring(0, 25)[this.metaBoxTheme])
	} else {
		this.screen.graphics.drawText(this.sideWidth + xoffset + 39, 3, "Table Name: ".bold[this.metaBoxTheme] + this.dataPane.meta.table.substring(0, 25)[this.metaBoxTheme])
	}

	this.screen.graphics.drawText(this.sideWidth + xoffset, 4, "Columns: ".bold[this.metaBoxTheme] + columnString[this.metaBoxTheme])
}

StudioFormatter.prototype.fullPageAlert = function(err, colour, shouldClear, isFullScreen) {
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
	var ypos = this.metaWindowHeight + (this.dataPaneHeight / 2) - (this.dataPaneHeight / (this.dataPaneHeight / height));
	var xpos = parseInt(this.sideWidth + (((this.width - this.sideWidth) / 2) - (width / 2)));

	if (isFullScreen) {
		xpos = parseInt((this.width / 2) - (width / 2));
	}

	this.screen.graphics.drawBox(xpos - 1, ypos + 1, width, height, " " ["bgBlack"]);
	this.screen.graphics.drawBox(xpos, ypos, width, height, " " [colour]);

	for (var i = stringCutdown.length - 1; i >= 0; i--) {
		this.screen.graphics.drawText(xpos + 2, ypos + 1 + i, stringCutdown[i][colour].bold);
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

	if (this.dataPane.scroll.x < 0) {
		this.dataPane.scroll.x = 0;
	}

	if (this.dataPane.scroll.y < 0) {
		this.dataPane.scroll.y = 0;
	}

	if (oldx != this.dataPane.scroll.x || oldy != this.dataPane.scroll.y) {
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