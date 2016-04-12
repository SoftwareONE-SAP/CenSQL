var charm = require('charm')(process.stdout);
var colors = require("colors");
var async = require("async");
var _ = require('lodash');
var StudioFormatter = require('./StudioFormatter.js');
var StudioDbHandler = require('./StudioDbHandler.js');
var StudioSqlConsole = require('./StudioSqlConsole.js');

var StudioSession = function(screen, hdb) {
	this.screen = screen;
	this.hdb = hdb;

	this.studioDbHandler = new StudioDbHandler(hdb);
	this.sqlConsole = new StudioSqlConsole(screen, this.studioDbHandler);
	this.formatter = new StudioFormatter(screen, this.sqlConsole);

	this.dataPreviewRows = 5000;

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
	 * Load control keys
	 */
	this.setControlKeys();

	/**
	 * Copy the keypress function
	 * @type [Function]
	 */
	this.oldKeyPress = process.stdin._events.keypress;

	/**
	 * Bind keypresses to out listener
	 * @type [Function]
	 */
	process.stdin._events.keypress = this.onKeyPress.bind(this);

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

			this.formatter.init(schemas, tables);

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

	switch (this.formatter.focus) {
		case "sql-console":
			this.loadSqlControls();
			break;
		case "data-pane":
			this.loadDatapaneControls();
			break;
	}

}

StudioSession.prototype.loadSqlControls = function() {
	this.controlKeys.false.false.right = function() {
		this.sqlConsole.moveCursor(1, 0);
	}.bind(this);

	this.controlKeys.false.false.left = function() {
		this.sqlConsole.moveCursor(-1, 0);
	}.bind(this);

	this.controlKeys.false.false.down = function() {
		this.sqlConsole.moveCursor(0, 1)
	}.bind(this);

	this.controlKeys.false.false.up = function() {
		this.sqlConsole.moveCursor(0, -1)
	}.bind(this);

	this.controlKeys.false.false.backspace = function() {
		this.sqlConsole.backspace();
	}.bind(this);
}

StudioSession.prototype.loadUiControls = function() {
	this.controlKeys.false.true.down = function() {
		this.formatter.rotateSchemas(1);
	}.bind(this);

	this.controlKeys.false.true.up = function() {
		this.formatter.rotateSchemas(-1);
	}.bind(this);

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

	this.controlKeys.false.true.tab = function() {
		this.toggleTableBoxView();
	}.bind(this);

	this.controlKeys.false.false.tab = function() {
		this.formatter.toggleFocus();
		this.setControlKeys();
	}.bind(this);

	this.controlKeys.true.false.c = function() {
		this.exitStudio();
	}.bind(this);

	this.controlKeys.true.false.down = function() {
		this.formatter.rotateTables(1);
	}.bind(this);

	this.controlKeys.true.false.up = function() {
		this.formatter.rotateTables(-1);
	}.bind(this);

	this.controlKeys.true.false.right = function() {
		if (this.formatter.schemas[0] && this.formatter.tables[0]) {
			this.loadTableView(this.formatter.schemas[0].SCHEMA_NAME, this.formatter.tables[0].NAME, this.formatter.tableListMode == "Views");
		}
	}.bind(this);
}

StudioSession.prototype.loadDatapaneControls = function() {
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

	this.controlKeys.false.false.pagedown = function() {
		this.formatter.scrollDataPaneDebounced(0, Math.abs(this.formatter.height - 10))
	}.bind(this);

	this.controlKeys.false.false.pageup = function() {
		this.formatter.scrollDataPaneDebounced(0, -Math.abs(this.formatter.height - 10))
	}.bind(this);

	this.controlKeys.false.false.home = function() {
		this.formatter.scrollDataPaneDebounced(-Infinity, -Infinity)
	}.bind(this);
}

StudioSession.prototype.onKeyPress = function(ch, key) {

	var pressed = false;

	if (key) {
		if (_.has(this.controlKeys, key.ctrl + "." + key.shift + "." + key.name)) {
			_.get(this.controlKeys, key.ctrl + "." + key.shift + "." + key.name)();
			pressed = true;
		}

	}

	if (!pressed && this.formatter.focus == "sql-console" && ch) {
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