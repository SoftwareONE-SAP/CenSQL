
var StorageChartCommandHandler = function(){
	this.includeInAudit = false
}

StorageChartCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT CONCAT(HOST, CONCAT(' - ', PATH)), CAST(USED_SIZE / 1024 / 1024 / 1024 AS INTEGER) AS \"Used\", CAST(TOTAL_SIZE / 1024 / 1024 / 1024 AS INTEGER) - CAST(USED_SIZE / 1024 / 1024 / 1024 AS INTEGER) AS \"Total\" FROM SYS.M_DISKS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "bar-chart" : "json", "Total Disk Usage"]);
	})
}

module.exports = StorageChartCommandHandler;