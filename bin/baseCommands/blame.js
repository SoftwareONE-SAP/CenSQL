var BlameCommandHandler = function() {
	this.includeInAudit = false
}

BlameCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

	var rowLimit = 10;
	var user = null;

	argv = require('optimist')(cParts).argv;

	if (argv._.length > 1) {
		user = argv._[1]
	}

	if (argv._.length > 2 && !isNaN(argv._[2])) {
		rowLimit = parseInt(argv._[2]);
	}

	if (!user) {
		callback([1, "Invalid syntax! Try: '\\h' for help.", "message"])
		return;
	}

	var sql = "SELECT LAST_EXECUTION_TIMESTAMP AS TIME, STATEMENT_STRING AS STATEMENT FROM M_SQL_PLAN_CACHE WHERE USER_NAME = '" + user + "' ORDER BY LAST_EXECUTION_TIMESTAMP DESC LIMIT " + rowLimit;

	conn.exec("conn", sql, function(err, data) {
		callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = BlameCommandHandler;