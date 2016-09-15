var async = require("async");

var TableTailCommandHandler = function() {
	this.description = "";
}

TableTailCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

	this.conn = conn;
	this.screen = screen;

	if (cParts.length < 3) {
		callback([1, "Invalid syntax \\tail! Try: '\\h' for help.", "message"])
		return;
	}

	this.isFirstRun = false;

	/**
	 * Get command arguments
	 */
	var isForever = cParts[3] == "-f" || cParts[3] == "--forever" || cParts[4] == "-f" || cParts[4] == "--forever";
	this.limit = (cParts[3] == "-f" || cParts[3] == "--forever" ? 10 : !isNaN(cParts[3]) ? parseInt(cParts[3]) : 10);
	this.delay = (cParts[3] == "-f" || cParts[3] == "--forever" ? (!isNaN(cParts[4]) && parseFloat(cParts[4]) >= 0.1 ? parseFloat(cParts[4]) * 1000 : 2000) : (cParts[4] == "-f" || cParts[4] == "--forever" ? (!isNaN(cParts[5]) && parseFloat(cParts[5]) >= 0.1 ? parseFloat(cParts[5]) * 1000 : 2000) : 2000));
	this.tableName = cParts[1]

	this.orderColumn = this.getActualColumnName(cParts[2]);

	this.lastMaxValue = -1;

	/**
	 * Is the command being ran in in constant mode
	 */
	if (isForever) {

		/**
		 * Allow the user to ^C out
		 */
		process.stdin.resume();

		/**
		 * Save that we're now running
		 * @type {Boolean}
		 */
		this.running = true;

		/**
		 * Start the main loops
		 */
		this.loop(callback);


		this.listenForExit();


		/**
		 * Run the command once
		 */
	} else {

		this.tailTable(function(err, data) {

			if (err) {
				callback([1, err, "json"]);
				return;
			}

			callback([0, [data], "default"]);

		});

	}
}

TableTailCommandHandler.prototype.loop = function(callback) {
	var counts = [];

	/**
	 * Whilst the user does not want to quit, count constantly
	 */
	async.whilst(function() {
		return this.running
	}.bind(this), function(next) {

		/**
		 * We shall need to call this exsternally to finally end this when the user exits
		 */
		this.mainLoopCallback = next

		/**
		 * Run ping
		 */
		this.tailTable(function(err, data) {

			if (this.running) {

				this.screen.clear();

				this.screen.print(this.screen.formatters["table"]("", data, "", this.screen).join("\n"));

				this.delayTimeout = setTimeout(function() {
					next();
				}, this.delay);
			}

		}.bind(this));

	}.bind(this), function(err) {

		if (counts.length == 0) counts = [0];

		/**
		 * Calculate average/sum and display to user
		 */
		callback([null, "", "message"]);
	})
}

TableTailCommandHandler.prototype.listenForExit = function() {
	/**
	 * Constantly check if we should exit. (This should probably be replaced with an event system one day)
	 */
	async.whilst(function() {
		return !global.SHOULD_EXIT
	}, function(next) {

		/**
		 * Check again in 10ms
		 */
		setTimeout(next, 10);

	}.bind(this).bind(this), function(err) {

		/**
		 * We should exit now!
		 */

		// console.log("Done listening for exit!");

		/**
		 * Stop the main loop
		 */
		this.running = false;

		/**
		 * Kill the current delay
		 */
		if (this.delayTimeout) {

			/**
			 * Get rid of the wait for the enxt loop
			 */
			clearTimeout(this.delayTimeout);

			/**
			 * End the main loop's last call
			 */
			setTimeout(this.mainLoopCallback, 0);
		}

	}.bind(this))
}

TableTailCommandHandler.prototype.tailTable = function(callback) {

	var sql = "SELECT * FROM " + this.tableName +
		" ORDER BY " + this.orderColumn + " DESC " +
		"LIMIT " + (this.limit);

	this.conn.exec("conn", sql, function(err, data) {
		if (err) {
			callback(err);
			return
		}

		callback(null, data);

	}.bind(this))

}


TableTailCommandHandler.prototype.getActualColumnName = function(column) {
	/**
	 * Column is quoted
	 */
	if (column.substring(0, 1) + column.substring(column.length - 1, column.length) == '""') {
		return column;
	}

	return column.toUpperCase();
}

module.exports = TableTailCommandHandler;