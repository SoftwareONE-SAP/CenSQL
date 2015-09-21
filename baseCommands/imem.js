
var InstanceMemoryCommandHandler = function(){
	this.description = "";
}

InstanceMemoryCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, MAX(INSTANCE_TOTAL_MEMORY_USED_SIZE), MIN(SNAPSHOT_ID)\
        FROM _SYS_STATISTICS.HOST_RESOURCE_UTILIZATION_STATISTICS\
        WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
        GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
        ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "Memory usage over the last 3 days", 3 * 24]);
    })
}

module.exports = InstanceMemoryCommandHandler;