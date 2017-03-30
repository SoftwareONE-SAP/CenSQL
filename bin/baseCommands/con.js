
var ConnectionsCommandHandler = function(){
	this.includeInAudit = true;
}

ConnectionsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var sql = "\
		SELECT \
			C.HOST, \
			C.USER_NAME, \
			COUNT(*) AS AMOUNT, \
			SUM(S.SELECT_EXECUTION_COUNT) AS SELECTS,\
			SUM(S.UPDATE_COUNT) AS UPDATES,\
			SUM(S.ROLLBACK_COUNT) AS ROLLBACKS,\
			MAX(LAST_EXECUTED_TIME) AS LAST_EXECUTED_TIME\
		FROM SYS.M_CONNECTIONS AS C \
		JOIN SYS.M_CONNECTION_STATISTICS AS S ON (C.CONNECTION_ID = S.CONNECTION_ID)\
		WHERE \
			(C.CONNECTION_STATUS = 'RUNNING' OR C.CONNECTION_STATUS = 'IDLE') \
			AND C.AUTHENTICATION_METHOD <> 'INTERNAL' \
		GROUP BY C.HOST, C.USER_NAME \
		ORDER BY C.HOST, C.USER_NAME"

	conn.exec("conn", sql, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = ConnectionsCommandHandler;