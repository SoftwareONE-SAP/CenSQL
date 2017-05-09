var colors = require("colors");
var stripColorCodes = require('stripcolorcodes');

var centerPad = function(s, w, c) {

	if (!c) {
		c = " ";
	}

	/**
	 * Side to add the char. False == left
	 */
	var side = false;

	while (stripColorCodes(s).length < w) {
		if (side) {
			s = s + c;
		} else {
			s = c + s;
		}

		side = !side;
	}

	return s;
}

var drawheader = function() {
	var output = [];

	output.push(centerPad("ERROR OCCURED".bold, global.censql.graphWidth, "-").red)

	return output;
}

/**
 * From stack overflow: http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
 */
var toTitleCase = function(str) {
	return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

module.exports = function(command, data) {

	var output = drawheader();

	if (data.command) {
		output.push(" COMMAND: ".red.bold + data.command.trim().dim);
	}

	if (data.sql) {
		output.push(" SQL: ".red.bold + data.sql.trim().dim);
	}

	if (data.message) {

		var errorMessage = data.message.substring(data.message.indexOf(":") + 2, data.message.length);

		var errorKey = toTitleCase(data.message.substring(0, data.message.indexOf(":"))).replace("Sql", "SQL");
		output.push(" ERROR: ".bold.red + errorKey.trim())

		if (data.code) {
			output.push(" CODE: ".bold.red + data.code)
		}

		var errorPos = "";

		errorMessage = errorMessage.replace(/line\ \d+\ col\ \d+\ \(at\ pos\ \d+\)/, function(v) {
			errorPos += "line ";
			errorPos += v.substring(5, v.indexOf("col") - 1).bold.underline
			errorPos += " col " + v.substring(v.indexOf("col") + 4, v.indexOf("pos") - 5).bold.underline
			errorPos += " pos " + v.substring(v.indexOf("pos") + 4, v.indexOf(")")).bold.underline

			return "";
		});

		if (errorMessage.substring(errorMessage.length - 2) == ": ") errorMessage = errorMessage.substring(0, errorMessage.length - 2)

		if (errorMessage.length > 0) output.push(" DESCRIPTION: ".bold.red + errorMessage.trim())
		if (errorPos.length > 0) output.push(" POSITION: ".bold.red + errorPos.trim());

	} else {
		return JSON.stringify(data, null, 2).split("\n");
	}

	if(!data.command && !data.sql && !data.message){
		output = JSON.stringify(data, null, 2).split("\n");
	}

	return output;

}