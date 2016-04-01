var StudioDbHandler = function(hdb) {
	this.hdb = hdb;
}

StudioDbHandler.prototype.init = function(callback) {
	this.hdb.cloneConnection("conn", "studioConn", callback);
}

StudioDbHandler.prototype.getSchemas = function(callback){
	this.hdb.exec("studioConn", "SELECT * FROM SYS.SCHEMAS ORDER BY SCHEMA_NAME", callback);
}

StudioDbHandler.prototype.getTables = function(schema, callback){
	// this.hdb.exec("studioConn", "SELECT * FROM SYS.M_TABLES WHERE SCHEMA_NAME = 'SYS' ORDER BY TABLE_NAME", callback);
	this.hdb.exec("studioConn", "SELECT TABLE_NAME AS NAME FROM SYS.M_TABLES WHERE SCHEMA_NAME = '" + schema + "' ORDER BY NAME", callback);
}

StudioDbHandler.prototype.getViews = function(schema, callback){
	this.hdb.exec("studioConn", "SELECT VIEW_NAME AS NAME FROM SYS.VIEWS WHERE  SCHEMA_NAME = '" + schema + "' ORDER BY NAME", callback);
}

module.exports = StudioDbHandler;