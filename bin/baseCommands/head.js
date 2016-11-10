var async = require("async");

var TableHeadCommandHandler = function() {
	this.includeInAudit = false
}

TableHeadCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

	this.conn = conn;
	this.screen = screen;

	if (cParts.length < 3) {
		callback([1, "Invalid syntax for \\head! Try: '\\h' for help.", "message"])
		return;
	}

	/**
	 * Get command arguments
	 */
	this.limit = (!isNaN(cParts[3]) ? parseInt(cParts[3]) : 10);
	this.tableName = cParts[1]

	this.orderColumn = this.getActualColumnName(cParts[2]);

	this.headTable(function(err, data) {

		if (err) {
			callback([1, err, "json"]);
			return;
		}

		callback([0, data, "default"]);

	});
}

TableHeadCommandHandler.prototype.headTable = function(callback) {

	var sql = "SELECT * FROM " + this.tableName +
		" ORDER BY " + this.orderColumn + " ASC " +
		"LIMIT " + (this.limit);

	this.conn.exec("conn", sql, function(err, data) {
		if (err) {
			callback(err);
			return
		}

		callback(null, data);

	}.bind(this))

}


TableHeadCommandHandler.prototype.getActualColumnName = function(column) {
	/**
	 * Column is quoted
	 */
	if (column.substring(0, 1) + column.substring(column.length - 1, column.length) == '""') {
		return column;
	}

	return column.toUpperCase();
}

module.exports = TableHeadCommandHandler;