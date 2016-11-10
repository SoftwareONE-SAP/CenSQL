
var InstancesCommandHandler = function(){
	this.includeInAudit = true;
}

InstancesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT * FROM SYS.M_DATABASE", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = InstancesCommandHandler;