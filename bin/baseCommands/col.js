var ShowColumnsCommandHandler = function(){
	this.description = "";
}

ShowColumnsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	if(cParts.length < 2){
		callback([1, "Invalid syntax! Try: '\\h' for help.", "message"])
        return;
	}

	var object = cParts[1].match(/\w+|"(?:\\"|[^"])+"/g);

	var schema = "CURRENT_SCHEMA";
	var table = object[0];

	if(object.length > 1){
		schema = "'" + object[0] + "'";
		table = object[1];
	}

	if(table[0] == '"' && table[table.length - 1] == '"'){
		table = table.substring(1, table.length - 1);
	}

	conn.exec("conn", "SELECT POSITION, CASE WHEN INDEX_TYPE = 'NONE' THEN 'NO' WHEN INDEX_TYPE = 'FULL' THEN 'YES' ELSE INDEX_TYPE END AS IS_KEY, COLUMN_NAME, DATA_TYPE_NAME FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME = " + schema + " AND TABLE_NAME = '" + table + "' ORDER BY POSITION", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = ShowColumnsCommandHandler;