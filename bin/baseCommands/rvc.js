
var CapacityGraphCommandHandler = function(){
	this.includeInAudit = false
}

CapacityGraphCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){
    
	conn.exec("conn", 
		"SELECT \
			CAST(MAX(R.USED_SIZE) AS BIGINT) AS \"Row Data\", \
			SUM(CAST(C.MEMORY_SIZE_IN_MAIN AS BIGINT) + CAST(C.MEMORY_SIZE_IN_DELTA AS BIGINT) + CAST(C.MEMORY_SIZE_IN_HISTORY_MAIN AS BIGINT) + CAST(C.MEMORY_SIZE_IN_HISTORY_DELTA AS BIGINT)) AS \"Total Column Data In Memory\", \
			SUM(\
				CASE \
					WHEN C.LOADED = 'FULL' \
						THEN 0 \
					WHEN CAST(C.ESTIMATED_MAX_MEMORY_SIZE_IN_TOTAL AS BIGINT) - CAST(C.MEMORY_SIZE_IN_TOTAL AS BIGINT) < 0 \
						THEN 0 \
					ELSE CAST(C.ESTIMATED_MAX_MEMORY_SIZE_IN_TOTAL AS BIGINT) - CAST(C.MEMORY_SIZE_IN_TOTAL AS BIGINT) \
					END\
				) AS \"Unloaded Column Data\", \
			SUM(CAST(C.MEMORY_SIZE_IN_MAIN AS BIGINT) + \
				CAST(C.MEMORY_SIZE_IN_DELTA AS BIGINT) + \
				CAST(C.MEMORY_SIZE_IN_HISTORY_MAIN AS BIGINT) + \
				CAST(C.MEMORY_SIZE_IN_HISTORY_DELTA AS BIGINT) \
				) - (SELECT ALLOCATION_LIMIT FROM PUBLIC.M_HOST_RESOURCE_UTILIZATION) AS \"Free Memory\" \
		FROM _SYS_STATISTICS.HOST_RS_MEMORY AS R \
		JOIN _SYS_STATISTICS.HOST_COLUMN_TABLES_PART_SIZE AS C ON (\
			YEAR(R.SNAPSHOT_ID) = YEAR(C.SNAPSHOT_ID) AND \
			MONTH(R.SNAPSHOT_ID) = MONTH(C.SNAPSHOT_ID) AND \
			DAYOFMONTH(R.SNAPSHOT_ID) = DAYOFMONTH(C.SNAPSHOT_ID) AND \
			HOUR(R.SNAPSHOT_ID) = HOUR(C.SNAPSHOT_ID)) \
		WHERE R.SNAPSHOT_ID > ADD_DAYS(CURRENT_UTCTIMESTAMP, -5) \
		GROUP BY \
			YEAR(R.SNAPSHOT_ID), \
			MONTH(R.SNAPSHOT_ID), \
			DAYOFMONTH(R.SNAPSHOT_ID), \
			HOUR(R.SNAPSHOT_ID) \
		ORDER BY \
			YEAR(R.SNAPSHOT_ID) ASC, \
			MONTH(R.SNAPSHOT_ID) ASC, \
			DAYOFMONTH(R.SNAPSHOT_ID) ASC, \
			HOUR(R.SNAPSHOT_ID) ASC", function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "area-graph" : "json", "Row vs column data over the last " + (!err ? data.length : "N/A") + " hours"]);
    })

}

module.exports = CapacityGraphCommandHandler;