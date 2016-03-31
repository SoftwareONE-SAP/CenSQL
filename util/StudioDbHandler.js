var StudioDbHandler = function(hdb) {
	this.hdb = hdb;
}

StudioDbHandler.prototype.init = function(callback) {
	this.hdb.cloneConnection("conn", "studioConn", callback);
}

StudioDbHandler.prototype.getSchemas = function(callback){
	this.hdb.exec("studioConn", "SELECT * FROM SYS.SCHEMAS", callback);
}

module.exports = StudioDbHandler;