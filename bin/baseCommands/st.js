
var StatusCommandHandler = function(){
	this.includeInAudit = true;
}

StatusCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", 
	    "SELECT HOST, HOST_ACTIVE, HOST_STATUS FROM SYS.M_LANDSCAPE_HOST_CONFIGURATION ORDER BY HOST", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = StatusCommandHandler;