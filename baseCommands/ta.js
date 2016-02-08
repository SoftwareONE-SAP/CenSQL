
var TableViewCommandHandler = function(){
	this.description = "";
}

TableViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT TABLE_OID, SCHEMA_NAME, TABLE_NAME, TABLE_TYPE FROM SYS.TABLES WHERE SCHEMA_NAME LIKE '" + cParts[1] + "' ORDER BY TABLE_NAME", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = TableViewCommandHandler;