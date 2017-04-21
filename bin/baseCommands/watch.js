var async = require("async")

var WatchCommandHandler = function(commandHandler) {
    this.commandHandler = commandHandler;

    this.description = "Run a command over and over again displaying the output";
}

WatchCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

    /**
     * Allow the user to ^C out
     */
    process.stdin.resume();

    var wParts = command.split(" ");

    /** 
     * Remove 'watch' from the command args
     */
    wParts.splice(0, 1);

    if (wParts.length < 1) {
        callback([1, "Invalid syntax! Try: '\\watch -i 5 \\al' to get a view of the alerts for the instance updating every 5 seconds", "message"])
        return;
    }

    var argv = require('optimist')(cParts.splice(1)).default("i", 1).alias('t', 'tail').boolean('t').argv;

    /**
     * Find delay
     */
    this.delay = ((argv.i > 0 ? argv.i : 0.1) * 1000)

    this.shouldClear = !(argv.t)
    
    /**
     * Save that we're now running
     * @type {Boolean}
     */
    this.running = true;

    /**
     * Start the main loops
     */
    this.loop(argv._.join(" "), screen, callback);
    this.listenForExit();

}

WatchCommandHandler.prototype.loop = function(command, screen, callback) {

    /**
     * Whilst the user does not want to quit, run the command constantly
     */
    async.whilst(function() {
        return this.running
    }.bind(this), function(next) {

        /**
         * Run the command and get the output
         */
        this.runCommand(command, screen, function() {

            /**
             * Wait to to run again
             */
            this.delayTimeout = setTimeout(function() {
                next();
            }, this.delay);

        }.bind(this));

    }.bind(this).bind(this), function(err) {
        callback([null, "", "message"]);
    })
}

WatchCommandHandler.prototype.listenForExit = function() {

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

    }.bind(this))
}

WatchCommandHandler.prototype.runCommand = function(command, screen, callback) {

    this.commandHandler.onCommand(command, function(err, output) {
        if (this.shouldClear) screen.clear();

        screen.printCommandOutput(command, output, callback, true);
    }.bind(this));
}

module.exports = WatchCommandHandler;