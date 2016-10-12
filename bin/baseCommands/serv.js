
var ServicesCommandHandler = function(){
	this.description = "";
}

ServicesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT * FROM SYS.M_SERVICES", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = ServicesCommandHandler;