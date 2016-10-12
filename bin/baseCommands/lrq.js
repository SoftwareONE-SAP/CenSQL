var LongRunningQueriesCommandHandler = function(){
	this.description = "";
}

LongRunningQueriesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var rowLimit = 10;

	argv = require('optimist')(cParts).default('t', 30).argv;

	if (argv._.length > 1 && !isNaN(argv._[1])) {
		rowLimit = parseInt(argv._[1]);
	}

	conn.exec("conn", "SELECT USER_NAME, EXECUTION_COUNT, LAST_EXECUTION_TIMESTAMP, MAX_EXECUTION_TIME / 1000 / 1000 AS DURATION_SECONDS, STATEMENT_STRING FROM SYS.M_SQL_PLAN_CACHE WHERE MAX_EXECUTION_TIME >= " + (argv.t * 1000 * 1000) + " AND USER_NAME NOT IN ('_SYS_STATISTICS', 'SYS', '_SYS_BIC') ORDER BY AVG_EXECUTION_TIME DESC LIMIT " + rowLimit, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = LongRunningQueriesCommandHandler;