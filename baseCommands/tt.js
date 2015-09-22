
var TopTablesCommandHandler = function(){
	this.description = "";
}

TopTablesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT SCHEMA_NAME, TABLE_NAME, LOADED, MEMORY_SIZE_IN_TOTAL, ESTIMATED_MAX_MEMORY_SIZE_IN_TOTAL FROM SYS.M_CS_TABLES ORDER BY MEMORY_SIZE_IN_TOTAL DESC, MEMORY_SIZE_IN_DELTA DESC LIMIT " + parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10), function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
    })
}

module.exports = TopTablesCommandHandler;