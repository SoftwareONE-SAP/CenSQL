var MergeStatisticsCommandHandler = function() {
	this.includeInAudit = false
}

MergeStatisticsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

	var argv = require('optimist')(cParts).default('s', "%").default('t', "%").argv;

	var schema = (typeof argv.s == "string" ? argv.s : (typeof argv.s == "number" ? "" + argv.s : "%"));
	var table = (typeof argv.t == "string" ? argv.t : (typeof argv.t == "number" ? "" + argv.t : "%"));;

	/**
	 * Unquote things if they're quoted
	 */

	if (table[0] == '"' && table[table.length - 1] == '"') {
		table = table.substring(1, table.length - 1);
	}

	if (schema[0] == '"' && schema[schema.length - 1] == '"') {
		schema = schema.substring(1, schema.length - 1);
	}

	var limit = (parseInt(argv._[1]) > 0 ? parseInt(argv._[1]) : 10)

	var sql = "SELECT START_TIME, HOST, SCHEMA_NAME, TABLE_NAME, PART_ID, SUCCESS, MOTIVATION, TYPE, MEMORY_MERGE, EXECUTION_TIME, MERGED_DELTA_RECORDS, LAST_ERROR, ERROR_DESCRIPTION FROM M_DELTA_MERGE_STATISTICS";

	conn.exec("conn", sql + " WHERE TABLE_NAME LIKE ? AND SCHEMA_NAME LIKE ? ORDER BY START_TIME DESC LIMIT " + limit, [table, schema], function(err, data) {
		callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})

}

module.exports = MergeStatisticsCommandHandler;