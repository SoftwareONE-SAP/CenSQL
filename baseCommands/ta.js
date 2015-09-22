
var TableViewCommandHandler = function(){
	this.description = "";
}

TableViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT * FROM SYS.TABLES WHERE SCHEMA_NAME LIKE '" + cParts[1] + "'", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = TableViewCommandHandler;