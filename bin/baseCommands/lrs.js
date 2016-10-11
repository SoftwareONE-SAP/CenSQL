var LongRunningStatementsCommandHandler = function(){
	this.description = "";
}

LongRunningStatementsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var timeLimit = 30;
	var rowLimit;

	if(cParts[1] == "-t"){
		timeLimit = parseInt(cParts[2] && !isNaN(cParts[2]) ? cParts[2] : 30);
		rowLimit = parseInt(cParts[3] && !isNaN(cParts[3]) ? cParts[3] : 10);
	}else{
		rowLimit = parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10);
	}

	conn.exec("conn", "SELECT HOST, PORT, CONNECTION_ID, STATEMENT_ID, DB_USER, APP_USER, START_TIME, (DURATION_MICROSEC / 1000) AS DURATION_SECONDS, STATEMENT_STRING FROM SYS.M_EXECUTED_STATEMENTS WHERE DB_USER NOT IN ('_SYS_REPO', '_SYS_STATISTICS', 'SYS', '_SYS_TASK', '_SYS_AFL') AND DURATION_MICROSEC > (1000 * 1000 * " + timeLimit + ") ORDER BY START_TIME DESC LIMIT " + rowLimit, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = LongRunningStatementsCommandHandler;