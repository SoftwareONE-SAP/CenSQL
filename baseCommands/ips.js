var async = require("async")

var InsertsPerSecondHandler = function() {
	this.description = "";
}

InsertsPerSecondHandler.prototype.run = function(command, cParts, conn, screen, callback) {
	this.conn = conn;

	/**
	 * Get command arguments
	 */
	var isForever = cParts[2] == "-f" || cParts[2] == "--forever";
	this.schemaName = cParts[1];
	this.delay = (cParts[3] && parseFloat(cParts[3]) > 0 ? parseFloat(cParts[3]) * 1000 : 2000);

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

		this.getInsertsPerSecond(function(data) {

			callback([0, [data], "default"]);

		});

	}

}

InsertsPerSecondHandler.prototype.loop = function(callback) {
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
		this.getInsertsPerSecond(function(data) {

			console.log("Current count: " + data.Count + ". Inserts per second: " + data.InsertsPerSecond)

			/** 
			 * Store all ping times so we can generate an average
			 */
			counts.push(data.InsertsPerSecond);

			if(this.running){
				this.delayTimeout = setTimeout(function() {
					next();
				}, 100);
			}

		}.bind(this));

	}.bind(this), function(err) {
		/**
		 * Calculate average and display to user
		 */
		callback([null, "\nAverage: " + parseInt(counts.reduce(function(a, b) {
			return a + b;
		}) / counts.length) + "\nSum: " + parseInt(counts.reduce(function(a, b) {
			return a + b;
		})), "message"]);
	})
}

InsertsPerSecondHandler.prototype.listenForExit = function() {
	/**
	 * Constantly check if we should exit. (This should probably be replaced with an event system one day)
	 */
	async.whilst(function() {
		return !GLOBAL.SHOULD_EXIT
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

InsertsPerSecondHandler.prototype.getInsertsPerSecond = function(callback) {

	this.conn.exec("conn", "SELECT SUM(RECORD_COUNT) AS ROW_COUNT FROM SYS.M_CS_TABLES WHERE SCHEMA_NAME LIKE '" + this.schemaName + "'", function(err, data) {
		if (err) throw err;

		var startCount = data[0]['ROW_COUNT'];

		var startTime = new Date().getTime()

		setTimeout(function() {
			this.conn.exec("conn", "SELECT SUM(RECORD_COUNT) AS ROW_COUNT FROM SYS.M_CS_TABLES WHERE SCHEMA_NAME LIKE '" + this.schemaName + "'", function(err, data) {
				if (err) throw err;

				callback({Count: data[0]['ROW_COUNT'], InsertsPerSecond: parseInt((data[0]['ROW_COUNT'] - startCount) / ((new Date().getTime() - startTime) / 1000))});
			}.bind(this))

		}.bind(this), this.delay);

	}.bind(this))

}

module.exports = InsertsPerSecondHandler;