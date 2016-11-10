
var SchemaViewCommandHandler = function(){
	this.includeInAudit = false;
}

SchemaViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT * FROM SYS.SCHEMAS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = SchemaViewCommandHandler;