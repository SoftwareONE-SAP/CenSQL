var async = require("async")

var PingCommandHandler = function() {
    this.description = "Ping the HANA instance by making a new connection";
}

PingCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {
    this.conn = conn;

    /**
     * Get command arguments
     */
    var isForever = cParts[1] == "-f" || cParts[1] == "--forever";
    var delay = (cParts[2] && parseFloat(cParts[2]) > 0 ? parseFloat(cParts[2]) * 1000 : 500);

    /**
     * Is the command being ran in in constant ping mode
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
        this.loop(delay, callback);
        this.listenForExit();

        /**
         * Run the command once
         */
    } else {

        this.ping(function(diff) {

            callback([0, "Ping Time (ms): " + diff, "message"]);

        });

    }

}

PingCommandHandler.prototype.loop = function(delay, callback) {
    var pings = [];

    /**
     * Whilst the user does not want to quit, ping constantly
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
        this.ping(function(diff) {

            if (this.running) {

                console.log("Ping Time (ms): " + diff)

                /** 
                 * Store all ping times so we can generate an average
                 */
                pings.push(diff);

                this.delayTimeout = setTimeout(function() {
                    next();
                }, delay);

            }

        }.bind(this));

    }.bind(this), function(err) {

        if(pings.length == 0) pings = [-1];

        /**
         * Calculate average and display to user
         */
        callback([null, "\nAverage: " + parseInt(pings.reduce(function(a, b) {
            return a + b;
        }) / pings.length), "message"]);
    })
}

PingCommandHandler.prototype.listenForExit = function() {
    /**
     * Constantly check if we should exit. (This should probably be replaced with an event system one day)
     */
    async.whilst(function() {
        return !global.censql.SHOULD_EXIT
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

PingCommandHandler.prototype.ping = function(callback) {
    var startTime = new Date().getTime();

    this.conn.cloneConnection("conn", "ping-conn", function() {

        this.conn.close("ping-conn");

        var diff = new Date().getTime() - startTime;

        callback(diff);

    }.bind(this));
}

module.exports = PingCommandHandler;