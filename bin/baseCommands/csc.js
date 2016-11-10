
var CsRecordCountCommandHandler = function(){
	this.includeInAudit = false
}

CsRecordCountCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT YEAR(SNAPSHOT_ID), MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), 'Instance', SUM(RECORD_COUNT), MIN(SNAPSHOT_ID)\
        FROM _SYS_STATISTICS.HOST_COLUMN_TABLES_PART_SIZE\
        WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_UTCTIMESTAMP, -3)\
        GROUP BY YEAR(SNAPSHOT_ID), MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID)\
        ORDER BY YEAR(SNAPSHOT_ID) DESC, MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC", function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "CS record count over the last 3 days", 3 * 24]);
    })

}

module.exports = CsRecordCountCommandHandler;