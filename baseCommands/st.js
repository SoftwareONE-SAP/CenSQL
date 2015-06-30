
var StatusCommandHandler = function(){
	this.description = "";
	this.helpText = "";
}

StatusCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var isGroupView = cParts[cParts.length - 1].toLowerCase() == "g"

	conn.exec("conn", 
	    "SELECT HOST,HOST_ACTIVE,HOST_STATUS FROM SYS.M_LANDSCAPE_HOST_CONFIGURATION ORDER BY HOST", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (isGroupView ? "group" : "table") : "json"]);
	})
}

module.exports = StatusCommandHandler;