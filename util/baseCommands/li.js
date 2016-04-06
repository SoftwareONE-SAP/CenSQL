
var LicenseCommandHandler = function(){
	this.description = "";
}

LicenseCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT SYSTEM_ID, HARDWARE_KEY, INSTALL_NO, SYSTEM_NO, START_DATE, EXPIRATION_DATE, VALID, LOCKED_DOWN FROM M_LICENSE", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = LicenseCommandHandler;