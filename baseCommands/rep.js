
var ReplicationCommandHandler = function(){
	this.description = "";
}

ReplicationCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var isGroupView = cParts[cParts.length - 1].toLowerCase() == "g"

	var query = '\
        SELECT "M_SERVICE_REPLICATION"."HOST", "M_VOLUMES"."SERVICE_NAME", "M_VOLUMES"."SUBPATH", \
            "M_SERVICE_REPLICATION"."VOLUME_ID", "M_SERVICE_REPLICATION"."SITE_NAME", "M_SERVICE_REPLICATION"."SECONDARY_HOST", \
            "M_SERVICE_REPLICATION"."SECONDARY_SITE_NAME", "M_SERVICE_REPLICATION"."REPLICATION_STATUS", "M_SERVICE_REPLICATION"."REPLICATION_MODE", \
            SECONDS_BETWEEN(\'1970-01-01 00:00:00\', "M_SERVICE_REPLICATION"."LAST_LOG_POSITION_TIME"), SECONDS_BETWEEN(\'1970-01-01 00:00:00\', "M_SERVICE_REPLICATION"."SHIPPED_LOG_POSITION_TIME"), \
            SECONDS_BETWEEN("M_SERVICE_REPLICATION"."SHIPPED_LOG_POSITION_TIME", "M_SERVICE_REPLICATION"."LAST_LOG_POSITION_TIME") AS "TIME_DIFF"\
        FROM M_SERVICE_REPLICATION\
        JOIN M_VOLUMES ON ("M_SERVICE_REPLICATION"."VOLUME_ID" = "M_VOLUMES"."VOLUME_ID")';

	conn.exec("conn", query, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (isGroupView ? "group" : "table") : "json"]);
	})
}

module.exports = ReplicationCommandHandler;