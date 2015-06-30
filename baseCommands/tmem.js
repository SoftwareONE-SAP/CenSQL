
var TotalMemoryCommandHandler = function(){
	this.description = "";
	this.helpText = "";
}

TotalMemoryCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var isGroupView = cParts[cParts.length - 1].toLowerCase() == "g"

	conn.exec("conn", "SELECT CONCAT(CONCAT(HOST, ' - ') , SERVICE_NAME), TOTAL_MEMORY_USED_SIZE, EFFECTIVE_ALLOCATION_LIMIT - TOTAL_MEMORY_USED_SIZE FROM SYS.M_SERVICE_MEMORY", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "bar-chart" : "json", "Total Memory Usage"]);
	})
}

module.exports = TotalMemoryCommandHandler;