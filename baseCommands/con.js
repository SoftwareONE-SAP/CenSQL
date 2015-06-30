
var ConnectionsCommandHandler = function(){
	this.description = "";
	this.helpText = "";
}

ConnectionsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var isGroupView = cParts[cParts.length - 1].toLowerCase() == "g"

	conn.exec("conn", "SELECT HOST, USER_NAME, COUNT(*) AS AMOUNT FROM SYS.M_CONNECTIONS WHERE CONNECTION_STATUS = 'RUNNING' OR CONNECTION_STATUS = 'IDLE' GROUP BY HOST, USER_NAME", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (isGroupView ? "group" : "table") : "json"]);
	})
}

module.exports = ConnectionsCommandHandler;