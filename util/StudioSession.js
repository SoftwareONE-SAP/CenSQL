var charm = require('charm')(process.stdout);
var colors = require("colors");
var _ = require('lodash');
var StudioFormatter = require('./StudioFormatter.js');

var StudioSession = function(screen, hdb) {
	this.formatter = new StudioFormatter(screen);
	this.screen = screen;
	this.hdb = hdb;

	this.screen.clear();
	this.screen.print(colors.yellow("Loading..."));

	this.hdb.cloneConnection("conn", "studioConn", function(err, data){
		if(err){
			this.screen.error(err, function(){
				process.exit(1);
			});
		}else{
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

	this.formatter.init();
}

StudioSession.prototype.onKeyPress = function(ch, key) {

	/**
	 * Odd but allows keys[IsControllPressed][IsShiftPressed][KeyName]()
	 */
	var keys = {
		false: {
			true: {
				"s": function() {
					console.log("Banflute");
				}
			}
		},
		true: {
			false: {
				"c": this.exitStudio.bind(this),
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