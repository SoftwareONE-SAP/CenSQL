var debug = require("debug")("censql:ScreenManager");
var readline = require('readline-history');
var charm = require('charm')(process.stdout);
var path = require('path');

var ScreenManager = function(isBatch, commandHandler) {
    this.isBatch = isBatch;
    this.commandHandler = commandHandler;
    this.init.call(this);
}

/**
 * Initialize settings and prepare the screen manager
 */
ScreenManager.prototype.init = function() {

    if (!this.isBatch) {
        this.printHeader();
    }

    this.settings = {
        plotHeight: 10
    }

    this.loadDataFormatters();
    this.loadPipeHandlers();

    this.setupInput();
}

ScreenManager.prototype.loadPipeHandlers = function(){
    this.handlers = {};

    require('fs').readdirSync(__dirname + '/../pipeCommands/').forEach(function(file) {

        if (file.match(/\.js$/) !== null) {

            var name = file.replace('.js', '');
            
            this.handlers[name] = require('../pipeCommands/' + file);

        }

    }.bind(this));

}

ScreenManager.prototype.loadDataFormatters = function(){
    this.formatters = {};

    require('fs').readdirSync(__dirname + '/../dataFormatters/').forEach(function(file) {

        if (file.match(/\.js$/) !== null) {

            var name = file.replace('.js', '');
            
            this.formatters[name] = require('../dataFormatters/' + file);

        }

    }.bind(this));

}

/**
 * Add an input handler to the cli and pass it to the commandHandler
 */
ScreenManager.prototype.setupInput = function() {

    if(!process.stdout.isTTY){

        process.stdout.on('error', function( err ) {
            if (err.code == "EPIPE") {
                process.exit(0);
            }
        })

        return;
    }

    readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        path: path.join(process.env.HOME, ".censql_hist"),
        maxLength: 0x10,
        next: function(rl){
            this.rl = rl;

            this.rl.on('line', function(line) {

                /**
                 * remove the user input since we will add it back again later with colour
                 */
                charm.up(1);
                charm.erase("line");
                charm.left(99999);

                /**
                 * Stop taking user input until we have complted this request
                 */
                process.stdin.pause();

                /**
                 * Send the user command to the command handler
                 */
                this.commandHandler.handleCommand(line, function(output) {

                    /**
                     * Print the command to the screen however the command handler thinks is best
                     */
                    this.printCommandOutput(line, output);

                }.bind(this));

            /**
             * On close, give the user a pretty message and then stop the entire program
             */
            }.bind(this)).on('close', function() {

                charm.foreground("green");
                charm.write('\nHave a great day!\n');
                charm.foreground("white");

                this.rl.close();
                process.exit(0);
            }.bind(this));

            /**
             * When the user ^Cs make sure they weren't just trying to clear the command
             */
            this.rl.on('SIGINT', function() {


                charm.erase("line");
                charm.left(99999);
                charm.up(1);

                /**
                 * Exit command promt
                 */
                this.rl.close();

                /**
                 * Exit program
                 */
                process.exit(0);

            }.bind(this));

        }.bind(this)

    });
}

/**
 * Print a pretty header when the user enters interactive mode
 */
ScreenManager.prototype.printHeader = function() {

    charm.foreground("cyan");
    charm.display("underscore");
    charm.display("bright");

    charm.write("Welcome to CenSQL for SAP HANA!\n\n");

    charm.display("reset");

    charm.foreground("yellow");

    charm.write("Connecting to HANA...");

    process.stdin.pause();

}

/**
 * The rest of the program is ready for user input, start listening on stdin
 */
ScreenManager.prototype.ready = function() {

    charm.erase("line");

    /**
     * Todo: allow for teminals more than 9999999 chars wide
     */
    charm.left(9999999);

    charm.display("reset");
    charm.display("bright");
    charm.foreground("cyan");

    charm.write("For help type \\h\n-----------------------------------------------------\n\n");

    charm.display("reset");

    charm.foreground("cyan");
    charm.write("> ");
    charm.display("reset");

    process.stdin.resume();
}

ScreenManager.prototype.message = function(message) {
    charm.write(message + "\n");
}

/**
 * Print the output to a command entered by the user
 * @param  {String} command The command the user ran
 * @param  {Array} output  the data and how to display it
 */
ScreenManager.prototype.printCommandOutput = function(command, output) {

    /**
     * Re-enable the command line
     */
    process.stdin.resume();

    var commandParts = command.replace(/([^\\])\|/g, "$1$1|").split(/[^\\]\|/);

    /**
     * Dont print the command if it was a batch command
     */
    if (!this.isBatch) {
        charm.write("> " + command + "\n\n");
    }

    /**
     * Pass the data to the chosen formatter
     */
    var lines = this.formatters[output[2]](output[1], output[3], this.settings);
    var pipedLines = this.processPipes(lines, commandParts);
    this.renderLines(pipedLines);

    /**
     * Dont display a prompt for batch requests
     */
    if (!this.isBatch) {
        charm.foreground("cyan");
        charm.write("> ");
    } else {
        charm.foreground("white");
    }

    charm.display("reset");
}

ScreenManager.prototype.processPipes = function(linesIn, commandParts){

    var linesOut = linesIn.slice(0);

    for(var j = 1; j < commandParts.length; j++){

        var commandName = commandParts[j].trim().split(" ")[0].toLowerCase();

        if(!this.handlers[commandName]){
            linesOut = ["Unknown command: " + commandName + ". try \\h for help"];
            continue;
        }

        linesOut = this.handlers[commandName](linesOut, commandParts[j])

    }

    return linesOut;

}

ScreenManager.prototype.renderLines = function(lines){
    for(var i = 0 ; i < lines.length; i++){
        charm.write(lines[i] + "\n");
    }
}

module.exports = ScreenManager;