var StudioDbHandler = function(hdb, commandHandler) {
	this.hdb = hdb;
	this.commandHandler = commandHandler;
}

StudioDbHandler.prototype.init = function(callback) {
	this.hdb.cloneConnection("conn", "studioConn", callback);
}

StudioDbHandler.prototype.getSchemas = function(callback){
	this.hdb.exec("studioConn", "SELECT * FROM SYS.SCHEMAS ORDER BY SCHEMA_NAME DESC", callback);
}

StudioDbHandler.prototype.getTables = function(schema, callback){
	// this.hdb.exec("studioConn", "SELECT * FROM SYS.M_TABLES WHERE SCHEMA_NAME = 'SYS' ORDER BY TABLE_NAME", callback);
	this.hdb.exec("studioConn", "SELECT TABLE_NAME AS NAME FROM SYS.M_TABLES WHERE SCHEMA_NAME = '" + schema + "' ORDER BY NAME", callback);
}

StudioDbHandler.prototype.getViews = function(schema, callback){
	this.hdb.exec("studioConn", "SELECT VIEW_NAME AS NAME FROM SYS.VIEWS WHERE  SCHEMA_NAME = '" + schema + "' ORDER BY NAME", callback);
}

StudioDbHandler.prototype.loadStructure = function(schema, table, callback){
	this.hdb.exec("studioConn", "SELECT COLUMN_NAME FROM (SELECT SCHEMA_NAME, VIEW_NAME AS NAME, COLUMN_NAME AS COLUMN_NAME FROM SYS.VIEW_COLUMNS UNION ALL SELECT SCHEMA_NAME, TABLE_NAME AS NAME, COLUMN_NAME FROM SYS.TABLE_COLUMNS) WHERE SCHEMA_NAME = '" + schema + "' AND NAME = '" + table + "'", callback)
}

StudioDbHandler.prototype.selectAllLimit = function(schema, table, limit, callback){
	this.hdb.exec("studioConn", 'SELECT * FROM "' + schema + '"."' + table + '" LIMIT ' + limit, callback);
}

StudioDbHandler.prototype.exec = function(query, callback){
	this.commandHandler.handleCommand(query, function(err, output){
		callback(err, output);
	})
}

module.exports = StudioDbHandler;