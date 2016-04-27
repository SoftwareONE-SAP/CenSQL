
var ViewsViewCommandHandler = function(){
	this.description = "";
}

ViewsViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	if(!cParts[1]){
		cParts[1] = "CURRENT_SCHEMA";
	}else{
		cParts[1] = "'" + cParts[1] + "'";
	}

	conn.exec("conn", "SELECT VIEW_NAME, VIEW_OID, IS_READ_ONLY, COMMENTS FROM SYS.VIEWS WHERE SCHEMA_NAME LIKE '" + cParts[1] + "'", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = ViewsViewCommandHandler;