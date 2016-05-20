
var AlertsCommandHandler = function(){
	this.description = "";
}

AlertsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT ALERT_TIMESTAMP, ALERT_RATING, ALERT_NAME, ALERT_DETAILS, INDEX FROM _SYS_STATISTICS.STATISTICS_CURRENT_ALERTS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = AlertsCommandHandler;