
var SwapUsageCommandHandler = function(){
	this.description = "";
	this.helpText = "";
}

SwapUsageCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, MAX(USED_SWAP_SPACE), MIN(SNAPSHOT_ID)\
        FROM _SYS_STATISTICS.HOST_RESOURCE_UTILIZATION_STATISTICS\
        WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
        GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
        ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "Swap usage over the last 3 days"]);
    })
}

module.exports = SwapUsageCommandHandler;