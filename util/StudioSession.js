var charm = require('charm')(process.stdout);
var colors = require("colors");
var async = require("async");
var _ = require('lodash');
var StudioFormatter = require('./StudioFormatter.js');
var StudioDbHandler = require('./StudioDbHandler.js');

var StudioSession = function(screen, hdb) {
	this.formatter = new StudioFormatter(screen);
	this.studioDbHandler = new StudioDbHandler(hdb);

	this.screen = screen;
	this.hdb = hdb;

	this.dataPreviewRows = 1000;

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
			console.log();
			this.formatter.fullPageAlert(err);
			console.log();
			process.exit(1);
		}

		this.studioDbHandler.getTables(schemas[0].SCHEMA_NAME, function(err, tables) {

			if (err) {
				console.log();
				this.formatter.fullPageAlert(err);
				console.log();
				process.exit(1);
			}

			this.formatter.init(schemas, tables);
		}.bind(this));
	}.bind(this));

}

StudioSession.prototype.onKeyPress = function(ch, key) {

	/**
	 * Odd but allows keys[IsControllPressed][IsShiftPressed][KeyName]()
	 */
	var keys = {
		false: {
			true: {
				"down": function() {
					this.formatter.rotateSchemas(1);
				}.bind(this),
				"up": function() {
					this.formatter.rotateSchemas(-1);
				}.bind(this),
				"right": function() {
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
				}.bind(this),
				"tab": this.toggleTableBoxView.bind(this)
			},
			false: {
				"right": function() {
					this.formatter.scrollDataPaneDebounced(10, 0)
				}.bind(this),
				"left": function() {
					this.formatter.scrollDataPaneDebounced(-10, 0)
				}.bind(this),
				"down": function() {
					this.formatter.scrollDataPaneDebounced(0, 5)
				}.bind(this),
				"up": function() {
					this.formatter.scrollDataPaneDebounced(0, -5)
				}.bind(this),
				"pagedown": function() {
					this.formatter.scrollDataPaneDebounced(0, Math.abs(this.formatter.height - 10))
				}.bind(this),
				"pageup": function() {
					this.formatter.scrollDataPaneDebounced(0, -Math.abs(this.formatter.height - 10))
				}.bind(this),
				"home": function() {
					this.formatter.scrollDataPaneDebounced(-Infinity, -Infinity)
				}.bind(this),
			}
		},
		true: {
			false: {
				"c": this.exitStudio.bind(this),
				"down": function() {
					this.formatter.rotateTables(1);
				}.bind(this),
				"up": function() {
					this.formatter.rotateTables(-1);
				}.bind(this),
				"right": function() {
					if (this.formatter.schemas[0] && this.formatter.tables[0]) {
						this.loadTableView(this.formatter.schemas[0].SCHEMA_NAME, this.formatter.tables[0].NAME, this.formatter.tableListMode == "Views");
					}
				}.bind(this)
			}
		}
	}

	if (_.has(keys, key.ctrl + "." + key.shift + "." + key.name)) {
		_.get(keys, key.ctrl + "." + key.shift + "." + key.name)();
	}

	// console.log(key.ctrl, key.shift, key.name);
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