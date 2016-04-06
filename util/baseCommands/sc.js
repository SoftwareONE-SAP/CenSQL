
var SchemaViewCommandHandler = function(){
	this.description = "";
}

SchemaViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT * FROM SYS.SCHEMAS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = SchemaViewCommandHandler;