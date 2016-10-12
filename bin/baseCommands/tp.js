var TablePreviewCommandHandler = function(){
	this.description = "";
}

TablePreviewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	if(cParts.length < 2){
		callback([1, "Invalid syntax! Try: '\\h' for help.", "message"])
        return;
	}

	var limit = parseInt(cParts[2] && !isNaN(cParts[2]) ? cParts[2] : 10);

	conn.exec("conn", "SELECT * FROM " + cParts[1] + " LIMIT " + limit, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = TablePreviewCommandHandler;