var ms = require("ms");

var TimeCommandHandler = function(commandHandler) {
    this.commandHandler = commandHandler;

    this.description = "Run a command over and over again displaying the output";
}

TimeCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

    command = command.split(" ").slice(1, command.length).join(" ");

    this.startTime = new Date();

    /**
     * Start the main loops
     */
    this.runCommand(command, screen, function() {
        
        var timingString = "Time Taken: " + ms(this.finishTime.getTime() - this.startTime.getTime());

        callback([0, timingString, "message"])
    }.bind(this));

}

TimeCommandHandler.prototype.runCommand = function(command, screen, callback) {

    this.commandHandler.onCommand(command, function(err, output) {

        this.finishTime = new Date();

        screen.printCommandOutput(command, output, callback, true);
    }.bind(this));
}

module.exports = TimeCommandHandler;