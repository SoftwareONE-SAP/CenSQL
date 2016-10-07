
var TopTablesCommandHandler = function(){
	this.description = "";
}

TopTablesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT SCHEMA_NAME, TABLE_NAME, RECORD_COUNT, (TABLE_SIZE / 1024 / 1024 / 1024) AS SIZE_GB, TABLE_TYPE, IS_PARTITIONED FROM M_TABLES ORDER BY TABLE_SIZE DESC LIMIT " + parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10), function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
    })
}

module.exports = TopTablesCommandHandler;