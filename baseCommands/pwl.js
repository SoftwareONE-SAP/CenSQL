
var PeakWorkloadCommandHandler = function(){
	this.description = "";
}

PeakWorkloadCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT HOST, PORT, PEAK_EXECUTION_RATE, PEAK_COMPILATION_RATE, PEAK_UPDATE_TRANSACTION_RATE, PEAK_TRANSACTION_RATE, PEAK_COMMIT_RATE, PEAK_ROLLBACK_RATE, PEAK_MEMORY_USAGE_RATE FROM M_WORKLOAD", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = PeakWorkloadCommandHandler;