
var HeapMemoryCommandHandler = function(){
	this.description = "";
	this.helpText = "";
}

HeapMemoryCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var isGroupView = cParts[cParts.length - 1].toLowerCase() == "g"

	conn.exec("conn", "SELECT CONCAT(CONCAT(HOST, ' - ') , SERVICE_NAME), HEAP_MEMORY_USED_SIZE, HEAP_MEMORY_ALLOCATED_SIZE - HEAP_MEMORY_USED_SIZE FROM SYS.M_SERVICE_MEMORY", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "bar-chart" : "json", "Heap Memory Usage"]);
	})
}

module.exports = HeapMemoryCommandHandler;