
var SchemaViewCommandHandler = function(){
	this.description = "";
}

SchemaViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", 
		"SELECT BACKUP_ID, UTC_START_TIME, STATE_NAME FROM sys.m_backup_catalog\
         WHERE ENTRY_TYPE_NAME = 'complete data backup'\
         ORDER BY entry_id DESC\
         LIMIT " + parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10),
	function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = SchemaViewCommandHandler;