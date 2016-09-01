
var TracefileContentCommandHandler = function(){
	this.description = "";
}

TracefileContentCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	if(cParts.length < 3){
		callback([1, "Invalid syntax! Try: '\\h' for help.", "message"])
        return;
	}

	conn.exec("conn", 
		"SELECT * FROM M_TRACEFILE_CONTENTS WHERE HOST = '" + cParts[1] + "' AND FILE_NAME = '" + cParts[2] + "'  ORDER BY OFFSET DESC LIMIT " + parseInt(cParts[3] && !isNaN(cParts[3]) ? cParts[3] : 10),
	function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = TracefileContentCommandHandler;