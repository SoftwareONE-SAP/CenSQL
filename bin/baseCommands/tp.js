var argv = require('optimist').argv;

var TablePreviewCommandHandler = function(){
	this.description = "";
}

TablePreviewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var limit = parseInt(cParts[2] && !isNaN(cParts[2]) ? cParts[2] : (argv.preview_size || 10))

	conn.exec("conn", "SELECT * FROM " + cParts[1] + " LIMIT " + limit, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = TablePreviewCommandHandler;