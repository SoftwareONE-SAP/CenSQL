var crypto = require("crypto");

var ActiveStatementsCommandHandler = function(){
	this.includeInAudit = true
}

ActiveStatementsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var rowLimit = 10;

	argv = require('optimist')(cParts).argv;

	if (argv._.length > 1 && !isNaN(argv._[1])) {
		rowLimit = parseInt(argv._[1]);
	}

	/**
	 * Generate a random string which is very unlikely to be involved in another running query. (We do this so we can filter out our query checking for queries)
	 * @type {[type]}
	 */
	var token = crypto.randomBytes(64).toString('hex');

	conn.exec("conn", "SELECT HOST, CONNECTION_ID, STATEMENT_ID, SECONDS_BETWEEN(LAST_EXECUTED_TIME, NOW()) AS DURATION_SECONDS, STATEMENT_STRING FROM SYS.M_ACTIVE_STATEMENTS WHERE STATEMENT_STRING NOT LIKE '%" + token + "%' ORDER BY LAST_EXECUTED_TIME DESC LIMIT " + rowLimit, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = ActiveStatementsCommandHandler;