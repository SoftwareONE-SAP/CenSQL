
var StorageChartCommandHandler = function(){
	this.description = "";
}

StorageChartCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT CONCAT(HOST, CONCAT(' - ', PATH)), CAST(USED_SIZE / 1024 / 1024 / 1024 AS INTEGER) AS USED_SIZE_GB, CAST(TOTAL_SIZE / 1024 / 1024 / 1024 AS INTEGER) - CAST(USED_SIZE / 1024 / 1024 / 1024 AS INTEGER) AS TOTAL_SIZE_GB FROM SYS.M_DISKS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "bar-chart" : "json", "Total Disk Usage"]);
	})
}

module.exports = StorageChartCommandHandler;