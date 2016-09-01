
var AgentsCommandHandler = function(){
	this.description = "";
}

AgentsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT * FROM SYS.M_AGENTS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = AgentsCommandHandler;