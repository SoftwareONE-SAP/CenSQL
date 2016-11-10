
var AlertsCommandHandler = function(){
	this.includeInAudit = true;
}

AlertsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var minVal = 0;

	if(!isNaN(cParts[1])){
		minVal = parseInt(cParts[1]);
	}

	conn.exec("conn", "SELECT ALERT_TIMESTAMP, ALERT_RATING, ALERT_NAME, ALERT_DETAILS, INDEX FROM _SYS_STATISTICS.STATISTICS_CURRENT_ALERTS WHERE ALERT_RATING >= " + minVal, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = AlertsCommandHandler;