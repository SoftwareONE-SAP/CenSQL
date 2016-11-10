
var ConnectionsCommandHandler = function(){
	this.includeInAudit = true;
}

ConnectionsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT HOST, USER_NAME, COUNT(*) AS AMOUNT FROM SYS.M_CONNECTIONS WHERE CONNECTION_STATUS = 'RUNNING' OR CONNECTION_STATUS = 'IDLE' GROUP BY HOST, USER_NAME", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = ConnectionsCommandHandler;