
var DiskViewCommandHandler = function(){
	this.description = "";
}

DiskViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var isGroupView = cParts[cParts.length - 1].toLowerCase() == "g"

	conn.exec("conn", "SELECT DISK_ID, DEVICE_ID, HOST, PATH, SUBPATH, FILESYSTEM_TYPE, USAGE_TYPE, CAST(TOTAL_SIZE / 1024 / 1024 / 1024 AS INTEGER) AS TOTAL_SIZE_GB, CAST(USED_SIZE / 1024 / 1024 / 1024 AS INTEGER) AS USED_SIZE_GB FROM SYS.M_DISKS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (isGroupView ? "group" : "table") : "json"]);
	})
}

module.exports = DiskViewCommandHandler;