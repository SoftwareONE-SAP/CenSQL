
var TableViewCommandHandler = function(){
	this.includeInAudit = false
}

TableViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	if(!cParts[1]){
		cParts[1] = "CURRENT_SCHEMA";
	}else{
		cParts[1] = "'" + cParts[1] + "'";
	}

	conn.exec("conn", "SELECT TABLE_OID, TABLE_NAME, TABLE_TYPE FROM SYS.TABLES WHERE SCHEMA_NAME LIKE " + cParts[1] + " ORDER BY TABLE_NAME", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = TableViewCommandHandler;