
var AgentsCommandHandler = function(){
	this.includeInAudit = true;
}

AgentsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT AGENT_NAME AS NAME, AGENT_VERSION, AGENT_STATUS AS STATUS, LAST_CONNECT_TIME, USED_PHYSICAL_MEMORY, FREE_PHYSICAL_MEMORY, USED_SWAP_SPACE, FREE_SWAP_SPACE FROM SYS.M_AGENTS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = AgentsCommandHandler;