
var DPTaskLogCommandHandler = function(){
	this.includeInAudit = true;
}

DPTaskLogCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var rowLimit = 10;

	var argv = require('optimist')(cParts).argv;

	if (argv._.length > 1 && !isNaN(argv._[1])) {
		rowLimit = parseInt(argv._[1]);
	}

	conn.exec("conn", "SELECT E.HOST, E.PORT, E.TASK_NAME, E.TASK_EXECUTION_ID, E.START_TIME, E.END_TIME, E.STATUS, E.TOTAL_PROGRESS_PERCENT, E.PROCESSED_RECORDS, M.MESSAGE_TEXT FROM _SYS_TASK.TASK_EXECUTIONS AS E LEFT JOIN _SYS_TASK.START_TASK_MESSAGES AS M ON (E.TASK_EXECUTION_ID = M.TASK_EXECUTION_ID) WHERE E.PARENT_TASK_EXECUTION_ID = 0 AND E.CURRENT_OPERATION = 'TASK' ORDER BY E.START_TIME DESC LIMIT " + rowLimit, function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
    })
}

module.exports = DPTaskLogCommandHandler;