
var AdaptersCommandHandler = function(){
	this.includeInAudit = true;
}

AdaptersCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT ADAPTER_NAME, LOCATION, AGENT_NAME FROM SYS.ADAPTER_LOCATIONS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = AdaptersCommandHandler;