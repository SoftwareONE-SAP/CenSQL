var LongRunningStatementsCommandHandler = function(){
	this.description = "";
}

LongRunningStatementsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var rowLimit = 10;

	argv = require('optimist')(cParts).default('t', 30).argv;

	if (argv._.length > 1 && !isNaN(argv._[1])) {
		rowLimit = parseInt(argv._[1]);
	}

	conn.exec("conn", "SELECT HOST, PORT, CONNECTION_ID, STATEMENT_ID, DB_USER, APP_USER, START_TIME, TO_INTEGER(DURATION_MICROSEC / 1000 / 1000) AS DURATION_SECONDS, STATEMENT_STRING FROM SYS.M_EXECUTED_STATEMENTS WHERE DB_USER NOT IN ('_SYS_REPO', '_SYS_STATISTICS', 'SYS', '_SYS_TASK', '_SYS_AFL') AND DURATION_MICROSEC > (1000 * 1000 * " + argv.t + ") ORDER BY START_TIME DESC LIMIT " + rowLimit, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = LongRunningStatementsCommandHandler;