
var WorkloadCommandHandler = function(){
	this.includeInAudit = true;
}

WorkloadCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT HOST, PORT, CURRENT_EXECUTION_RATE, CURRENT_COMPILATION_RATE, CURRENT_UPDATE_TRANSACTION_RATE, CURRENT_TRANSACTION_RATE, CURRENT_COMMIT_RATE, CURRENT_ROLLBACK_RATE, CURRENT_MEMORY_USAGE_RATE FROM M_WORKLOAD", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = WorkloadCommandHandler;