
var TopTablesCommandHandler = function(){
	this.description = "";
}

TopTablesCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var rowLimit = 10;

	var argv = require('optimist')(cParts).default('s', "").argv;

	if (argv._.length > 1 && !isNaN(argv._[1])) {
		rowLimit = parseInt(argv._[1]);
	}

	conn.exec("conn", "SELECT SCHEMA_NAME, TABLE_NAME, RECORD_COUNT, (TABLE_SIZE / 1024 / 1024 / 1024) AS SIZE_GB, TABLE_TYPE, IS_PARTITIONED FROM M_TABLES " + (argv.s.length > 0 ? "WHERE SCHEMA_NAME = '" + argv.s + "'" : "") + " ORDER BY TABLE_SIZE DESC LIMIT " + rowLimit, function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
    })
}

module.exports = TopTablesCommandHandler;