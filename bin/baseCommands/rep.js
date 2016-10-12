
var ReplicationCommandHandler = function(){
	this.description = "";
}

ReplicationCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var query = '' +
        'SELECT ' +
        	'"M_VOLUMES"."SERVICE_NAME", ' +
            '"M_SERVICE_REPLICATION"."HOST", ' +
            '"M_SERVICE_REPLICATION"."SITE_NAME", ' +
            '"M_SERVICE_REPLICATION"."SECONDARY_HOST", ' +
            '"M_SERVICE_REPLICATION"."SECONDARY_SITE_NAME", ' +
            '"M_SERVICE_REPLICATION"."REPLICATION_STATUS" AS STATUS, ' +
            '"M_SERVICE_REPLICATION"."REPLICATION_MODE", ' +
            '"M_SERVICE_REPLICATION"."LAST_LOG_POSITION_TIME" AS LOG_TIME, ' +
            '"M_SERVICE_REPLICATION"."SHIPPED_LOG_POSITION_TIME" AS SHIPPED_LOG_TIME, ' +
            'SECONDS_BETWEEN("M_SERVICE_REPLICATION"."SHIPPED_LOG_POSITION_TIME", "M_SERVICE_REPLICATION"."LAST_LOG_POSITION_TIME") AS "SECONDS_BEHIND" ' +
        'FROM M_SERVICE_REPLICATION ' +
        'JOIN M_VOLUMES ON ("M_SERVICE_REPLICATION"."VOLUME_ID" = "M_VOLUMES"."VOLUME_ID")';

	conn.exec("conn", query, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = ReplicationCommandHandler;