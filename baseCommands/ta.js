
var TableViewCommandHandler = function(){
	this.description = "";
	this.helpText = "";
}

TableViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var isGroupView = cParts[cParts.length - 1].toLowerCase() == "g"

	conn.exec("conn", "SELECT * FROM SYS.TABLES WHERE SCHEMA_NAME LIKE '" + cParts[1] + "'", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (isGroupView ? "group" : "table") : "json"]);
	})
}

module.exports = TableViewCommandHandler;