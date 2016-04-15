var charm = require('charm')(process.stdout);
var colors = require("colors");
var async = require("async");
var _ = require('lodash');
var StudioFormatter = require('./StudioFormatter.js');
var StudioDbHandler = require('./StudioDbHandler.js');
var StudioSqlConsole = require('./StudioSqlConsole.js');
var argv = require('optimist').argv;

var StudioSession = function(screen, hdb, commandHandler) {
	this.screen = screen;
	this.hdb = hdb;
	this.commandHandler = commandHandler;

	this.studioDbHandler = new StudioDbHandler(hdb, this.commandHandler);
	this.sqlConsole = new StudioSqlConsole(screen, this.studioDbHandler);
	this.formatter = new StudioFormatter(this, screen, this.sqlConsole);

	this.dataPreviewRows = argv.preview_size || 500;

	/**
	 * Print temp loading screen
	 */
	this.screen.clear();
	this.screen.print(colors.yellow("Loading..."));

	/**
	 * Clone hana connection
	 */
	this.studioDbHandler.init(function(err, data) {
		if (err) {
			this.screen.error(err, function() {
				process.exit(1);
			});
		} else {
			this.init();
		}
	}.bind(this))
}

StudioSession.prototype.init = function() {

	/**
	 * Current focus
	 * @type {String}
	 */
	this.focus = "sql-console";

	/**
	 * Copy the keypress function
	 * @type [Function]
	 */
	this.oldKeyPress = process.stdin._events.keypress;

	/**
	 * Disable keyboard input
	 * @type [Function]
	 */
	process.stdin._events.keypress = function() {}

	this.studioDbHandler.getSchemas(function(err, schemas) {

		if (err) {
			this.screen.clear();
			this.formatter.fullPageAlert(err, "bgRed", false, true);
			return
		}

		this.studioDbHandler.getTables(schemas[0].SCHEMA_NAME, function(err, tables) {

			if (err) {
				this.screen.clear();
				this.formatter.fullPageAlert(err, "bgRed", false, true);
				return
			}

			/**
			 * Draw
			 */
			this.formatter.init(schemas, tables);

			/**
			 * Load control keys
			 */
			this.setControlKeys();

			/**
			 * Bind keypresses to out listener
			 * @type [Function]
			 */
			process.stdin._events.keypress = this.onKeyPress.bind(this);

		}.bind(this));
	}.bind(this));
}

StudioSession.prototype.setControlKeys = function() {
	/**
	 * Odd but allows keys[IsControllPressed][IsShiftPressed][KeyName]()
	 */
	this.controlKeys = {
		false: {
			false: {},
			true: {}
		},
		true: {
			false: {},
			true: {}
		}
	};

	this.loadUiControls();

	switch (this.focus) {
		case "sql-console":
			this.loadSqlControls();
			break;
		case "data-pane":
			this.loadDatapaneControls();
			break;
	}

}

StudioSession.prototype.loadSqlControls = function() {

	/**
	 * Move console cursor
	 */
	this.controlKeys.false.false.right = function() {
		this.sqlConsole.moveCursor(1, 0, true);
	}.bind(this);

	this.controlKeys.false.false.left = function() {
		this.sqlConsole.moveCursor(-1, 0, true);
	}.bind(this);

	this.controlKeys.false.false.down = function() {
		this.sqlConsole.moveCursor(0, 1, true)
	}.bind(this);

	this.controlKeys.false.false.up = function() {
		this.sqlConsole.moveCursor(0, -1, true)
	}.bind(this);

	/**
	 * Backspace
	 */
	this.controlKeys.false.false.backspace = function() {
		this.sqlConsole.backspace();
	}.bind(this);

	/**
	 * Goto start of line
	 */
	this.controlKeys.false.false.home = function() {
		this.sqlConsole.moveCursor(-Infinity, 0, true)
	}.bind(this);

	/**
	 * Goto end of line
	 */
	this.controlKeys.false.false.end = function() {
		this.sqlConsole.moveCursor(Infinity, 0, true)
	}.bind(this);

	/**
	 * Pageup and down height of console
	 */
	this.controlKeys.false.false.pageup = function() {
		this.sqlConsole.moveScroll(-this.sqlConsole.region.h);
	}.bind(this);

	this.controlKeys.false.false.pagedown = function() {
		this.sqlConsole.moveScroll(this.sqlConsole.region.h);
	}.bind(this);

	/**
	 * Run query
	 */
	this.controlKeys.false.false.enter = function() {

		this.runUserQuery();

	}.bind(this);

	this.controlKeys.true.false.delete = function() {
		this.sqlConsole.clear();
	}.bind(this)
}

StudioSession.prototype.runUserQuery = function() {
	var query = this.sqlConsole.getQuery();

	this.studioDbHandler.exec(query, function(err, data) {

		if (err) {
			this.formatter.fullPageAlert(err);
			return;
		}

		this.formatter.drawOueryOutputView(query, data);
	}.bind(this));
}

StudioSession.prototype.loadUiControls = function() {

	/**
	 * Rotate schemas
	 */
	this.controlKeys.false.true.down = function() {
		this.formatter.rotateSchemas(1);
	}.bind(this);

	this.controlKeys.false.true.up = function() {
		this.formatter.rotateSchemas(-1);
	}.bind(this);

	/**
	 * Select schema
	 */
	this.controlKeys.false.true.right = function() {
		if (this.formatter.tableListMode == "Views") {

			this.studioDbHandler.getViews(this.formatter.schemas[0].SCHEMA_NAME, function(err, data) {
				if (err) {
					this.formatter.fullPageAlert(err);
					process.exit(1);
				}

				this.formatter.setTables(data);

			}.bind(this))
		} else {

			this.studioDbHandler.getTables(this.formatter.schemas[0].SCHEMA_NAME, function(err, data) {
				if (err) {
					this.formatter.fullPageAlert(err);
					process.exit(1);
				}

				this.formatter.setTables(data);

			}.bind(this))

		}
	}.bind(this);

	/**
	 * Switch between tables and views
	 */
	this.controlKeys.false.true.tab = function() {
		this.toggleTableBoxView();
	}.bind(this);

	/**
	 * Toggle between datapane and sql console
	 */
	this.controlKeys.false.false.tab = function() {
		this.toggleFocus();
		this.setControlKeys();
		this.sqlConsole.moveCursor();
	}.bind(this);

	/**
	 * Exit studio
	 */
	this.controlKeys.true.false.c = function() {
		this.exitStudio();
	}.bind(this);

	/**
	 * Rotate tables
	 */
	this.controlKeys.true.false.down = function() {
		this.formatter.rotateTables(1);
	}.bind(this);

	this.controlKeys.true.false.up = function() {
		this.formatter.rotateTables(-1);
	}.bind(this);

	/**
	 * Load table/view into datapane
	 */
	this.controlKeys.true.false.right = function() {
		if (this.formatter.schemas[0] && this.formatter.tables[0]) {
			this.loadTableView(this.formatter.schemas[0].SCHEMA_NAME, this.formatter.tables[0].NAME, this.formatter.tableListMode == "Views");
		}
	}.bind(this);
}

StudioSession.prototype.loadDatapaneControls = function() {

	/**
	 * Scroll datapane
	 */
	this.controlKeys.false.false.right = function() {
		this.formatter.scrollDataPaneDebounced(10, 0)
	}.bind(this);

	this.controlKeys.false.false.left = function() {
		this.formatter.scrollDataPaneDebounced(-10, 0)
	}.bind(this);

	this.controlKeys.false.false.down = function() {
		this.formatter.scrollDataPaneDebounced(0, 3)
	}.bind(this);

	this.controlKeys.false.false.up = function() {
		this.formatter.scrollDataPaneDebounced(0, -3)
	}.bind(this)

	/**
	 * Scroll entire page
	 */
	this.controlKeys.false.false.pagedown = function() {
		this.formatter.scrollDataPaneDebounced(0, Math.abs(this.formatter.height - 10))
	}.bind(this);

	this.controlKeys.false.false.pageup = function() {
		this.formatter.scrollDataPaneDebounced(0, -Math.abs(this.formatter.height - 10))
	}.bind(this);

	/**
	 * Goto top left of table
	 */
	this.controlKeys.false.false.home = function() {
		this.formatter.scrollDataPaneDebounced(-Infinity, -Infinity)
	}.bind(this);
}

StudioSession.prototype.toggleFocus = function() {
	if (this.focus == "sql-console") {
		this.focus = "data-pane";
	} else {
		this.focus = "sql-console";
	}

	this.formatter.drawBorder();
	this.formatter.drawHelpText();
}

StudioSession.prototype.onKeyPress = function(ch, key) {

	var pressed = false;

	/**
	 * If we have a control key for this input run it, if not type it
	 */
	if (key) {
		if (_.has(this.controlKeys, key.ctrl + "." + key.shift + "." + key.name)) {
			_.get(this.controlKeys, key.ctrl + "." + key.shift + "." + key.name)();
			pressed = true;
		}
	}

	/**
	 * Type into SQL console
	 */
	if (!pressed && this.focus == "sql-console" && ch) {
		this.sqlConsole.type(ch);
	}
}

StudioSession.prototype.loadTableView = function(schema, table, isView) {

	this.formatter.fullPageAlert('Loading ' + this.dataPreviewRows + ' rows from "' + schema + '"."' + table + '"...', "bgYellow");

	async.parallel([
		function(callback) {
			this.studioDbHandler.loadStructure(schema, table, callback)
		}.bind(this),
		function(callback) {
			this.studioDbHandler.selectAllLimit(schema, table, this.dataPreviewRows, callback)
		}.bind(this),
	], function(err, data) {

		if (err) {
			this.formatter.fullPageAlert(err);
			return;
		}

		this.formatter.drawTableView(schema, table, data[0], data[1], isView);
	}.bind(this))

}

StudioSession.prototype.toggleTableBoxView = function() {
	if (this.formatter.tableListMode == "Tables") {

		this.formatter.setTableListMode("Views");

		this.studioDbHandler.getViews(this.formatter.schemas[0].SCHEMA_NAME, function(err, data) {
			if (err) {
				this.formatter.fullPageAlert(err);
				process.exit(1);
			}

			this.formatter.setTables(data);

		}.bind(this))
	} else {

		this.formatter.setTableListMode("Tables");

		this.studioDbHandler.getTables(this.formatter.schemas[0].SCHEMA_NAME, function(err, data) {
			if (err) {
				this.formatter.fullPageAlert(err);
				process.exit(1);
			}

			this.formatter.setTables(data);

		}.bind(this))

	}
}

StudioSession.prototype.exitStudio = function() {
	this.formatter.byebye();
	process.exit(0);
}

module.exports = StudioSession;