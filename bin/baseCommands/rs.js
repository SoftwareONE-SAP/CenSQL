
var RemoteSourcesCommandHandler = function(){
	this.description = "";
}

RemoteSourcesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT REMOTE_SOURCE_NAME, ADAPTER_NAME, LOCATION, AGENT_NAME FROM PUBLIC.REMOTE_SOURCES", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = RemoteSourcesCommandHandler;