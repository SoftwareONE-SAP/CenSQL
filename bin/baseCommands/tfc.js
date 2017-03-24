var TracefileContentCommandHandler = function() {
	this.includeInAudit = false
}

TracefileContentCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

	if (cParts.length < 3) {
		callback([1, "Invalid syntax! Try: '\\h' for help.", "message"])
		return;
	}

	conn.exec("conn",
		"SELECT CONTENT FROM M_TRACEFILE_CONTENTS WHERE HOST = ? AND FILE_NAME = ? AND OFFSET > -? ORDER BY OFFSET DESC", [cParts[1], cParts[2], (parseInt(cParts[3] && !isNaN(cParts[3]) ? cParts[3] : 10) * 1000)],
		function(err, data) {
			if (err) {
				callback([1, err, "json"]);
				return;
			}

			var output = "";

			// data.reverse();

			for (var i = data.length - 1; i >= 0; i--) {
				output += data[i]['CONTENT'];
			}

			callback([0, output.substring(output.indexOf("\n") + 1), "message"])
		})
}

module.exports = TracefileContentCommandHandler;