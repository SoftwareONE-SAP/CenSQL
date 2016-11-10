
var SharedMemoryCommandHandler = function(){
	this.includeInAudit = false
}

SharedMemoryCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT CONCAT(CONCAT(HOST, ' - ') , PORT) AS HOST, NAME, VALUE FROM SYS.M_MEMORY WHERE NAME IN ('SHARED_MEMORY_USED_SIZE', 'SHARED_MEMORY_FREE_SIZE')", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "key-value-bar-chart" : "json", "Shared Memory Usage"]);
	})
}

module.exports = SharedMemoryCommandHandler;