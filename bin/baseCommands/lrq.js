var LongRunningQueriesCommandHandler = function(){
	this.description = "";
}

LongRunningQueriesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var timeLimit = 30;
	var rowLimit;

	if(cParts[1] == "-t"){
		timeLimit = parseInt(cParts[2] && !isNaN(cParts[2]) ? cParts[2] : 30);
		rowLimit = parseInt(cParts[3] && !isNaN(cParts[3]) ? cParts[3] : 10);
	}else{
		rowLimit = parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10);
	}

	conn.exec("conn", "SELECT USER_NAME, EXECUTION_COUNT, LAST_EXECUTION_TIMESTAMP, MAX_EXECUTION_TIME / 1000 / 1000 AS DURATION_SECONDS, STATEMENT_STRING FROM SYS.M_SQL_PLAN_CACHE WHERE MAX_EXECUTION_TIME >= " + (timeLimit * 1000 * 1000) + " AND USER_NAME NOT IN ('_SYS_STATISTICS', 'SYS', '_SYS_BIC') ORDER BY AVG_EXECUTION_TIME DESC LIMIT " + rowLimit, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = LongRunningQueriesCommandHandler;