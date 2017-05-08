var Bro = require("brototype");
var colors = require("colors");

var SettingsCommandHandler = function() {
	this.includeInAudit = true
}

SettingsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {
	this.settings = screen.settings;

	this.settingsKeys = this.getAvailableSettingTypes();

	var rowLimit = 10;

	args = require('optimist')(cParts).argv._.slice(1);

	if (args[0] == "set") {

		if (args.length < 3) {
			callback([1, "Invalid Syntax! Try: \\settings set csv.delimiter \";\"", "message"]);
			return;
		}

		this.set(args[1], args[2], callback);

	} else if (args[0] == "get") {

		if (args.length < 2) {
			callback([1, "Invalid Syntax! Try: \\settings get csv.delimiter", "message"]);
			return;
		}

		this.get(args[1], callback);

	} else if (args[0] == "list" || args[0] == "show") {

		var output = colors.bold("Available Settings:\n");

		Object.keys(this.settingsKeys).map(function(k){
			output += k + " - " + this.settingsKeys[k].description + "\n"
		}.bind(this));

		output = output.slice(0, -1);

		callback([1, output, "message"]);
		return;

	} else {
		callback([1, "Invalid Syntax! Run \\h for help.", "message"]);
		return;
	}

}

SettingsCommandHandler.prototype.set = function(key, value, callback) {
	if (key in this.settingsKeys) {

		/*
		 Check value is correct type for key
		 */
		if(typeof value !== this.settingsKeys[key].type){
			if(!(this.settingsKeys[key].type === "boolean" && (value === 0 || value === 1 || value === "false" || value === "true"))){
				callback([0, "Can not set " + key + " to '" + value + "'", "message"]);
				return;
			}
		}

		/*
		 Unquote if quoted
		 */
		if ((value[0] == '"' && value[value.length - 1] == '"') || (value[0] == "'" && value[value.length - 1] == "'")) {
			value = value.slice(1, -1);
		}

		/*
		 Replace escaped tab with tab
		 */
		if (typeof value == "string") {
			value = value.replace(/\\t/g, '\t');
		}

		/**
		 * Turn boolean numbers into actual booleans
		 */
		if(this.settingsKeys[key].type === "boolean" && typeof value == "number"){
			value = !!value;
		}

		if(this.settingsKeys[key].type === "boolean" && typeof value == "string"){
			value = (value === "true" ? true: false);
		}

		Bro(this.settings).makeItHappen(this.settingsKeys[key].location, value);

		this.settings.save(function(err){
			if(err){
				callback([0, "Error Saving Settings: '" + err.message, "message"]);
				return;
			}

			callback([0, "Done", "message"]);
		});
		
	} else {
		callback([0, "Error: '" + key + "' is not a setting", "message"]);
	}
}

SettingsCommandHandler.prototype.get = function(key, callback) {
	if (key in this.settingsKeys) {

		var value = Bro(this.settings).iCanHaz(this.settingsKeys[key].location);

		callback([0, value, "message"]);

	} else {
		callback([0, "Could not find '" + key + "'", "message"]);
	}
}

SettingsCommandHandler.prototype.getAvailableSettingTypes = function() {
	return {
		"csv.delimeter": {location: "csv.delimeter", type: "string", description: "Character(s) used to seperate values when formatting a csv"},
		"bar.height": {location: "barHeight", type: "number", description: "Height of bar chart bars. (Usually 1)"},
		"graph.height": {location: "plotHeight", type: "number", description: "Height of graphs such as /mem and /cpu"},
		"colour": {location: "colour", type: "boolean", description: "Use colour in the prompt"},
	}
}

module.exports = SettingsCommandHandler;