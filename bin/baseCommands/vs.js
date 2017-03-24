
var ViewsViewCommandHandler = function(){
	this.includeInAudit = false
}

ViewsViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var sql = "SELECT VIEW_NAME, VIEW_OID, IS_READ_ONLY, COMMENTS FROM SYS.VIEWS WHERE SCHEMA_NAME LIKE " + (cParts[1] ? "?" : "CURRENT_SCHEMA");

	conn.exec("conn", sql, (cParts[1] ? [cParts[1]] : []), function(err, data) {
		callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})

}

module.exports = ViewsViewCommandHandler;