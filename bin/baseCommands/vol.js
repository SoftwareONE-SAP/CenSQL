
var VolumeCommandHandler = function(){
	this.description = "";
}

VolumeCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT HOST, PORT, VOLUME_ID, FILE_NAME, TO_DECIMAL(USED_SIZE / 1024 / 1024 / 1024, 10, 2) AS USED_SIZE_GB, TO_DECIMAL(TOTAL_SIZE / 1024 / 1024 / 1024, 10, 2) AS TOTAL_SIZE_GB, TO_DECIMAL((TOTAL_SIZE - USED_SIZE) / 1024 / 1024 / 1024, 10, 2) AS FRAGMENTATION_GB, TO_DECIMAL((1 - USED_SIZE / TOTAL_SIZE ) * 100, 10, 2) AS FRAGMENTATION_PCT FROM M_VOLUME_FILES WHERE FILE_TYPE = 'DATA'", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = VolumeCommandHandler;