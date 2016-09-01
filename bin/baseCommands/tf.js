
var TracefilesCommandHandler = function(){
	this.description = "";
}

TracefilesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", 
		"SELECT * FROM SYS.M_TRACEFILES ORDER BY FILE_MTIME DESC LIMIT " + parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10),
	function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = TracefilesCommandHandler;