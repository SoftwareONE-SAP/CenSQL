
var CsMemoryCommandHandler = function(){
	this.description = "";
}

CsMemoryCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){
    
	conn.exec("conn", "SELECT YEAR(SNAPSHOT_ID), MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), 'Instance', SUM(MEMORY_SIZE_IN_TOTAL), MIN(SNAPSHOT_ID)\
        FROM _SYS_STATISTICS.HOST_COLUMN_TABLES_PART_SIZE\
        WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_UTCTIMESTAMP, -3)\
        GROUP BY YEAR(SNAPSHOT_ID), MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID)\
        ORDER BY YEAR(SNAPSHOT_ID) DESC, MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC", function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "CS memory total over the last 3 days", 3 * 24]);
    })

}

module.exports = CsMemoryCommandHandler;