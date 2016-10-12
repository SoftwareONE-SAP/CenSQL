var TopTablesPercentCommandHandler = function() {
	this.description = "";
}

TopTablesPercentCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

	var schemaLimit = "";
	var rowLimit;

	if (cParts[1] == "-s") {
		schemaLimit = cParts[2];
		rowLimit = parseInt(cParts[3] && !isNaN(cParts[3]) ? cParts[3] : 10);
	} else {
		rowLimit = parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10);
	}

	/**
	 * Get size of schema/whole database
	 */
	conn.exec("conn", "SELECT SUM(TABLE_SIZE) / 1024 / 1024 / 1024 AS TOTAL_SIZE_GB FROM M_TABLES " + (schemaLimit.length > 0 ? "WHERE SCHEMA_NAME = '" + schemaLimit + "'" : ""), function(err, data) {

		if (err) {
			callback([1, err, "json"]);
			return;
		}

		/**
		 * Check if schema exists if specified
		 */
		if (data.length == 0 || data[0].TOTAL_SIZE_GB == null) {
			callback([1, "Schema " + schemaLimit + " does not exist", "message"]);
			return;
		}

		var totalSize = data[0].TOTAL_SIZE_GB;

		/**
		 * Get size of tables
		 */
		conn.exec("conn",
			"SELECT SCHEMA_NAME, TABLE_NAME, (TABLE_SIZE / 1024 / 1024 / 1024) AS SIZE_GB FROM M_TABLES " +
			(schemaLimit.length > 0 ? "WHERE SCHEMA_NAME = '" + schemaLimit + "'" : "") +
			" ORDER BY TABLE_SIZE DESC LIMIT " +
			rowLimit,
			function(err, data) {

				if (err) {
					callback([1, err, "json"]);
					return;
				}

				var output = [];

				/**
				 * Build bar chart
				 */
				for (var i = 0; i < data.length; i++) {
					output.push({
						"Name": (schemaLimit.length == 0 ? data[i].SCHEMA_NAME + "." : "") + data[i].TABLE_NAME,
						"Size of Table": parseInt((totalSize == data[i].SIZE_GB ? 1 : data[i].SIZE_GB)),
						hidden: parseInt((totalSize == data[i].SIZE_GB ? 0 : totalSize - data[i].SIZE_GB))
					})
				}

				callback([0, output, "bar-chart"]);
			})
	})
}

module.exports = TopTablesPercentCommandHandler;