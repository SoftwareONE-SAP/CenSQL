
var TopTablesCommandHandler = function(){
	this.description = "";
}

TopTablesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT SCHEMA_NAME, TABLE_NAME, PART_ID, LOADED, MEMORY_SIZE_IN_TOTAL / 1024 / 1024 / 1024 AS TOTAL_MEMORY_GB, ESTIMATED_MAX_MEMORY_SIZE_IN_TOTAL / 1024 / 1024 / 1024 AS ESTIMATED_MAX_MEMORY_GB FROM SYS.M_CS_TABLES ORDER BY TOTAL_MEMORY_GB DESC, ESTIMATED_MAX_MEMORY_GB DESC LIMIT " + parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10), function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
    })
}

module.exports = TopTablesCommandHandler;