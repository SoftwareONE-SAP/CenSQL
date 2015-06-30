
var RowStorageCommandHandler = function(){
	this.description = "";
	this.helpText = "";
}

RowStorageCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, SUM(USED_FIXED_PART_SIZE), MIN(SNAPSHOT_ID)\
        FROM _SYS_STATISTICS.GLOBAL_ROWSTORE_TABLES_SIZE\
        WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
        GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
        ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "RS used fixed part size over the last 3 days"]);
    })
}

module.exports = RowStorageCommandHandler;