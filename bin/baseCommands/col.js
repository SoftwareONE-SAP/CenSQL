var ShowColumnsCommandHandler = function() {
	this.includeInAudit = false
}

ShowColumnsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

	if (cParts.length < 2) {
		callback([1, "Invalid syntax! Try: '\\h' for help.", "message"])
		return;
	}

	var object = cParts[1].match(/\w+|"(?:\\"|[^"])+"/g);

	var schema = null;
	var table = object[0];

	/**
	 * if schema supplied use it
	 */
	if (object.length > 1) {
		schema = object[0];
		table = object[1];
	}

	if (table[0] == '"' && table[table.length - 1] == '"') {
		table = table.substring(1, table.length - 1);
	}

	if (schema) {
		conn.exec("conn", "SELECT POSITION, CASE WHEN INDEX_TYPE = 'NONE' THEN 'NO' WHEN INDEX_TYPE = 'FULL' THEN 'YES' ELSE INDEX_TYPE END AS IS_KEY, COLUMN_NAME, DATA_TYPE_NAME AS COLUMN_TYPE, LENGTH FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME = ? AND TABLE_NAME = ? ORDER BY POSITION", [schema, table], function(err, data) {
			callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
		})
	}else{
		conn.exec("conn", "SELECT POSITION, CASE WHEN INDEX_TYPE = 'NONE' THEN 'NO' WHEN INDEX_TYPE = 'FULL' THEN 'YES' ELSE INDEX_TYPE END AS IS_KEY, COLUMN_NAME, DATA_TYPE_NAME AS COLUMN_TYPE, LENGTH FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME = CURRENT_SCHEMA AND TABLE_NAME = ? ORDER BY POSITION", [table], function(err, data) {
			callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
		})
	}


}

module.exports = ShowColumnsCommandHandler;