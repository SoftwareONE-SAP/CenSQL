
var DatabasesCommandHandler = function(){
	this.includeInAudit = true;
}

DatabasesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT DATABASE_NAME, ACTIVE_STATUS FROM SYS.M_DATABASES", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = DatabasesCommandHandler;