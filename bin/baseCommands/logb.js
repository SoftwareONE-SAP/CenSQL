
var LogBackupViewCommandHandler = function(){
	this.includeInAudit = true;
}

LogBackupViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", 
		"SELECT ENTRY_ID, SYS_START_TIME, SYS_END_TIME, STATE_NAME, MESSAGE FROM SYS.M_BACKUP_CATALOG WHERE ENTRY_TYPE_NAME = 'log backup' ORDER BY UTC_START_TIME DESC LIMIT " 
		+ parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10),
	function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = LogBackupViewCommandHandler;