var async = require("async");

var TopTablesPercentCommandHandler = function() {
	this.includeInAudit = false
}

TopTablesPercentCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

	this.rowLimit = 10;

	this.argv = require('optimist')(cParts).default('s', "").default('r', false).default('c', false).argv;

	if (this.argv._.length > 1 && !isNaN(this.argv._[1])) {
		this.rowLimit = parseInt(this.argv._[1]);
	}

	this.conn = conn;

	async.waterfall([
		(!this.argv.r ? this.getTotalSize.bind(this) : function(callback) {
			callback(null, null)
		}),
		this.getTableSizes.bind(this),
	], function(err, data) {
		if (err) {
			callback([1, err[1], "sql-error"]);
			return;
		}

		callback([0, data, "bar-chart"]);
	})


}

TopTablesPercentCommandHandler.prototype.getTotalSize = function(callback) {
	/**
	 * Get size of schema/whole database
	 */
	this.conn.exec("conn", "SELECT SUM(RECORD_COUNT) AS TOTAL_RECORD_COUNT, SUM(TABLE_SIZE) / 1024 / 1024 / 1024 AS TOTAL_SIZE_GB FROM M_TABLES " + (this.argv.s.length > 0 ? "WHERE SCHEMA_NAME = '" + this.argv.s + "'" : ""), function(err, data) {

		if (err) {
			callback(err, null);
			return;
		}

		/**
		 * Check if schema exists if specified
		 */
		if (data.length == 0 || data[0].TOTAL_SIZE_GB == null) {
			callback("Schema " + this.argv.s + " does not exist", "message", null);
			return;
		}

		callback(null, (this.argv.c ? data[0].TOTAL_RECORD_COUNT : data[0].TOTAL_SIZE_GB))
	}.bind(this))
}

TopTablesPercentCommandHandler.prototype.getTableSizes = function(totalSize, callback) {
	/**
	 * Get size of tables
	 */
	this.conn.exec("conn",
		"SELECT SCHEMA_NAME, TABLE_NAME, RECORD_COUNT, (TABLE_SIZE / 1024 / 1024 / 1024) AS SIZE_GB FROM M_TABLES " +
		(this.argv.s.length > 0 ? "WHERE SCHEMA_NAME = '" + this.argv.s + "'" : "") +
		" ORDER BY " + (this.argv.c ? "RECORD_COUNT" : "SIZE_GB") + " DESC LIMIT " +
		this.rowLimit,
		function(err, data) {

			if (err) {
				callback([1, err, "json"]);
				return;
			}

			var output = [];

			/**
			 * Make relative
			 */
			if(totalSize == null && data.length > 0){
				totalSize = (this.argv.c ? data[0].RECORD_COUNT : data[0].SIZE_GB);
			}

			/**
			 * Build bar chart
			 */
			for (var i = 0; i < data.length; i++) {
				output.push({
					"Name": (this.argv.s.length == 0 ? data[i].SCHEMA_NAME + "." : "") + data[i].TABLE_NAME + " - " + (this.argv.c ? data[i].RECORD_COUNT + " rows" : parseInt(data[i].SIZE_GB) + "GB"),
					"Size of Table": (this.argv.c ? parseInt(data[i].RECORD_COUNT) : parseFloat(data[i].SIZE_GB)),
					hidden: parseFloat((this.argv.c ? parseInt(data[i].RECORD_COUNT) : parseFloat(data[i].SIZE_GB)) == totalSize ? 0 : totalSize - (this.argv.c ? parseInt(data[i].RECORD_COUNT) : parseFloat(data[i].SIZE_GB)))
				})
			}

			callback(null, output);
		}.bind(this))
}

module.exports = TopTablesPercentCommandHandler;