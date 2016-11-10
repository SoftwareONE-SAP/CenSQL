
var DiskViewCommandHandler = function(){
	this.includeInAudit = true;
}

DiskViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){
	conn.exec("conn", "SELECT DISK_ID, DEVICE_ID, HOST, PATH, SUBPATH, FILESYSTEM_TYPE, USAGE_TYPE, CAST(TOTAL_SIZE / 1024 / 1024 / 1024 AS INTEGER) AS TOTAL_SIZE_GB, CAST(USED_SIZE / 1024 / 1024 / 1024 AS INTEGER) AS USED_SIZE_GB FROM SYS.M_DISKS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = DiskViewCommandHandler;