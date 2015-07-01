
var TotalMemoryCommandHandler = function(){
	this.description = "";
}

TotalMemoryCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT CONCAT(CONCAT(HOST, ' - ') , SERVICE_NAME), TOTAL_MEMORY_USED_SIZE, EFFECTIVE_ALLOCATION_LIMIT - TOTAL_MEMORY_USED_SIZE FROM SYS.M_SERVICE_MEMORY", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "bar-chart" : "json", "Total Memory Usage"]);
	})
}

module.exports = TotalMemoryCommandHandler;