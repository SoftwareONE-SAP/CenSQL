
var BackupViewCommandHandler = function(){
	this.includeInAudit = true;
}

BackupViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", 
		"SELECT BACKUP_ID, UTC_START_TIME, UTC_END_TIME, STATE_NAME, MESSAGE FROM sys.m_backup_catalog\
         WHERE ENTRY_TYPE_NAME = 'complete data backup'\
         ORDER BY entry_id DESC\
         LIMIT " + parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10),
	function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = BackupViewCommandHandler;