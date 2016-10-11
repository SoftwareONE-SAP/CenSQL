
var TopTablesCommandHandler = function(){
	this.description = "";
}

TopTablesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var schemaLimit = "";
	var rowLimit;

	if(cParts[1] == "-s"){
		schemaLimit = cParts[2];
		rowLimit = parseInt(cParts[3] && !isNaN(cParts[3]) ? cParts[3] : 10);
	}else{
		rowLimit = parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10);
	}

	conn.exec("conn", "SELECT SCHEMA_NAME, TABLE_NAME, RECORD_COUNT, (TABLE_SIZE / 1024 / 1024 / 1024) AS SIZE_GB, TABLE_TYPE, IS_PARTITIONED FROM M_TABLES " + (schemaLimit.length > 0 ? "WHERE SCHEMA_NAME = '" + schemaLimit + "'" : "") + " ORDER BY TABLE_SIZE DESC LIMIT " + rowLimit, function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
    })
}

module.exports = TopTablesCommandHandler;