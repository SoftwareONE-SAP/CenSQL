var charm = require('charm')(process.stdout);
var colors = require("colors");
var _ = require('lodash');
var StudioFormatter = require('./StudioFormatter.js');
var StudioDbHandler = require('./StudioDbHandler.js');

var StudioSession = function(screen, hdb) {
	this.formatter = new StudioFormatter(screen);
	this.studioDbHandler = new StudioDbHandler(hdb);

	this.screen = screen;
	this.hdb = hdb;

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
			this.screen.error(err);
			console.log();
			process.exit(1);
		}

		this.studioDbHandler.getTables(schemas[0], function(err, tables) {

			if (err) {
				console.log();
				this.screen.error(err);
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
				}.bind(this)
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
				}.bind(this)
			}
		}
	}

	if (_.has(keys, key.ctrl + "." + key.shift + "." + key.name)) {
		_.get(keys, key.ctrl + "." + key.shift + "." + key.name)();
	}

	// console.log(key.ctrl, key.shift, key.name);
}

StudioSession.prototype.exitStudio = function() {
	this.formatter.byebye();
	process.exit(0);
}

module.exports = StudioSession;