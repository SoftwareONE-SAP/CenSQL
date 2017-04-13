var SystemPrivilegesCommandHandler = function(){
	this.includeInAudit = false;
}

SystemPrivilegesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var args = require('optimist')(cParts).argv._;

	var user = (args.length > 1 ? args[1] : conn.getClientConfig("conn").user);

	conn.exec("conn", "SELECT GRANTEE, PRIVILEGE, GRANTOR, IS_GRANTABLE FROM GRANTED_PRIVILEGES WHERE GRANTEE_TYPE = 'USER' AND OBJECT_TYPE = 'SYSTEMPRIVILEGE' AND GRANTEE = ?", [user], function(err, data) {
		callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	}.bind(this))

}

module.exports = SystemPrivilegesCommandHandler;