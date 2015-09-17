
var CsMemoryCommandHandler = function(){
	this.description = "";
}

CsMemoryCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){
    
	conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), 'Instance', SUM(MEMORY_SIZE_IN_TOTAL), MIN(SNAPSHOT_ID)\
        FROM _SYS_STATISTICS.HOST_COLUMN_TABLES_PART_SIZE\
        WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
        GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID)\
        ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC", function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "CS memory total over the last 3 days"]);
    })

}

module.exports = CsMemoryCommandHandler;