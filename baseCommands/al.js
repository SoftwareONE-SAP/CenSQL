
var AlertsCommandHandler = function(){
	this.description = "";
	this.helpText = "";
}

AlertsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var isGroupView = cParts[cParts.length - 1].toLowerCase() == "g"

	conn.exec("conn", "SELECT ALERT_TIMESTAMP, ALERT_RATING, ALERT_NAME, ALERT_DETAILS, INDEX FROM _SYS_STATISTICS.STATISTICS_CURRENT_ALERTS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (isGroupView ? "group" : "table") : "json"]);
	})
}

module.exports = AlertsCommandHandler;