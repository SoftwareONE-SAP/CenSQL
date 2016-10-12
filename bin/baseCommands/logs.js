
var LogsSizeCommandHandler = function(){
	this.description = "";
}

LogsSizeCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT HOST, PORT, VOLUME_ID, FILE_NAME, TO_DECIMAL(TOTAL_SIZE / 1024 / 1024 / 1024, 10, 2) AS TOTAL_SIZE_GB FROM M_VOLUME_FILES WHERE FILE_TYPE = 'LOG'", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = LogsSizeCommandHandler;