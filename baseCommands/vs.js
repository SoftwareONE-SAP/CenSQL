
var ViewsViewCommandHandler = function(){
	this.description = "";
}

ViewsViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var isGroupView = cParts[cParts.length - 1].toLowerCase() == "g"

	conn.exec("conn", "SELECT VIEW_NAME, VIEW_OID, IS_READ_ONLY, COMMENTS FROM SYS.VIEWS WHERE SCHEMA_NAME LIKE '" + cParts[1] + "'", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (isGroupView ? "group" : "table") : "json"]);
	})
}

module.exports = ViewsViewCommandHandler;