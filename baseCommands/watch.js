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

    if(wParts.length < 1){
        callback([1, "Invalid syntax! Try: '\\watch -i 5 \\al' to get a view of the alerts for the instance updating every 5 seconds", "message"])
        return;
    }

    /**
     * Find delay
     */
    this.delay = this.getDelay(wParts);

    /**
     * Whilst the user does not want to quit, run the command constantly
     */
    async.whilst(function() {
        return !GLOBAL.SHOULD_EXIT
    }, function(next) {

        /**
         * Run the command and get the output
         */
        this.runCommand(wParts.join(" "), screen, function() {

            setTimeout(function() {
                next();
            }, this.delay);

        }.bind(this));

    }.bind(this).bind(this), function(err) {
        callback([null, null, "default"]);
    })


}

WatchCommandHandler.prototype.getDelay = function(wParts){
    var minDelay = 0.1;
    var defaultTime = 2000;

    for (var i = 0; i < wParts.length - 1; i++) {
        if(wParts[i] == "-i" || wParts[i] == "--interval"){
            
            /**
             * Get the delay
             */
            var delay = parseFloat(wParts[i + 1]);

            if(isNaN(delay)){
                delay = 1;
            }

            if(delay < minDelay){
                delay = minDelay;
            }

            /**
             * Remove both parts of the delay arg from wParts
             */
            wParts.splice(i, 2);

            return delay * 1000;
        }
    };

    return defaultTime;
}

WatchCommandHandler.prototype.runCommand = function(command, screen, callback){
    
    this.commandHandler.onCommand(command, function(output){
        screen.clear();

        screen.printCommandOutput(command, output, true);

        callback();
    });
}

module.exports = WatchCommandHandler;