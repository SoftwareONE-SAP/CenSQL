var readline = require('historic-readline');
var charm = require('charm')(process.stdout);
var colors = require("colors");
var path = require('path');
var async = require('async');
var stripColorCodes = require('stripcolorcodes');
var osHomedir = require('os-homedir');
var StudioSession = require("./studio/StudioSession.js");
var StudioGraphics = require("./studio/StudioGraphics.js");

var ScreenManager = function(isBatch, settings, commandHandler) {
    this.isBatch = isBatch;

    this.settings = settings;

    this.commandHandler = commandHandler;
}

/**
* Initialize settings and prepare the screen manager
*/
ScreenManager.prototype.init = function() {
    this.loadDataFormatters();
    this.loadPipeHandlers();

    if (!this.isBatch) {
        this.printHeader
    }

    this.setupInput();

}

ScreenManager.prototype.loadPipeHandlers = function() {
    this.pipeHandlers = {};
    this.pipeHandlersNames = [];

    this.pipeHandlers["cut"] = require("./pipeCommands/cut.js");
    this.pipeHandlers["grep"] = require("./pipeCommands/grep.js");
    this.pipeHandlers["head"] = require("./pipeCommands/head.js");
    this.pipeHandlers["tail"] = require("./pipeCommands/tail.js");
    this.pipeHandlers["wc"] = require("./pipeCommands/wc.js");

    this.pipeHandlersNames = Object.keys(this.pipeHandlers);

}

ScreenManager.prototype.loadDataFormatters = function() {
    this.formatters = {};

    this.formatters["bar-chart"] = require("./dataFormatters/bar-chart.js");
    this.formatters["bc"] = require("./dataFormatters/bc.js");
    this.formatters["c"] = require("./dataFormatters/c.js");
    this.formatters["csv"] = require("./dataFormatters/csv.js");
    this.formatters["default"] = require("./dataFormatters/default.js");
    this.formatters["g"] = require("./dataFormatters/g.js");
    this.formatters["group"] = require("./dataFormatters/group.js");
    this.formatters["jj"] = require("./dataFormatters/jj.js");
    this.formatters["j"] = require("./dataFormatters/j.js");
    this.formatters["json"] = require("./dataFormatters/json.js");
    this.formatters["key-value-bar-chart"] = require("./dataFormatters/key-value-bar-chart.js");
    this.formatters["kvbc"] = require("./dataFormatters/kvbc.js");
    this.formatters["lg"] = require("./dataFormatters/lg.js");
    this.formatters["line-graph"] = require("./dataFormatters/line-graph.js");
    this.formatters["message"] = require("./dataFormatters/message.js");
    this.formatters["m"] = require("./dataFormatters/m.js");
    this.formatters["pretty-json"] = require("./dataFormatters/pretty-json.js");
    this.formatters["table"] = require("./dataFormatters/table.js");
    this.formatters["t"] = require("./dataFormatters/t.js");

    this.formattersNames = Object.keys(this.formatters);
}

/**
* Add an input handler to the cli and pass it to the commandHandler
*/
ScreenManager.prototype.setupInput = function() {

    if (!process.stdout.isTTY) {
        process.stdout.on('error', function(err) {
            if (err.code == "EPIPE") {
                process.exit(0);
            }
        })
        return;
    }

    process.stdin.pause();

    readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        path: path.join(osHomedir(), ".censql", "censql_hist"),
        maxLength: 2000,
        prompt: colors.cyan("> "),
        next: function(rl) {
            this.rl = rl;

            this.rl.on('line', function(line) {

                if (GLOBAL.censql.RUNNING_PROCESS) return;

                /**
                * Check terminal width
                */
                GLOBAL.graphWidth = process.stdout.columns;

                /**
                * Stop taking user input until we complete this request
                */
                process.stdin.pause();

                /**
                * Save that we already have a running process
                * @type {Boolean}
                */
                GLOBAL.censql.RUNNING_PROCESS = true;

                /**
                * Hide user input whilst a command is running (simply pausing stdin still allows scrolling through history)
                */
                process.stdin._events._keypress_full = process.stdin._events.keypress;
                process.stdin._events.keypress = function(ch, key) {
                    if (key && key.ctrl && key.name == 'c') {
                        GLOBAL.SHOULD_EXIT = true;
                    }
                };

                /**
                * Send the user command to the command handler
                */
                this.commandHandler.handleCommand(line, function(err, output) {

                    /**
                    * Print the command to the screen however the command handler thinks is best
                    */
                    this.printCommandOutput(line, output, function() {

                        /**
                        * Re-enable the command line
                        */
                        process.stdin.resume();

                        /**
                        * Reset running app state
                        * @type {Boolean}
                        */
                        GLOBAL.censql.RUNNING_PROCESS = false;

                        /**
                        * Should the running process exit?
                        * @type {Boolean}
                        */
                        GLOBAL.SHOULD_EXIT = false;

                        /**
                        * Reset the keypress function for stdin
                        */
                        process.stdin._events.keypress = process.stdin._events._keypress_full;

                    }.bind(this));

                }.bind(this));

            }.bind(this));

            /**
            * On close, give the user a pretty message and then stop the entire program
            */
            this.rl.on('close', function() {

                this.print(colors.green('\n\nHave a great day!\n'));

                this.rl.close();
                process.exit(0);
            }.bind(this));

            /**
            * When the user ^Cs make sure they weren't just trying to clear the command
            */
            this.rl.on('SIGINT', function() {

                if (GLOBAL.censql.RUNNING_PROCESS) {
                    GLOBAL.SHOULD_EXIT = true;
                    return;
                }

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

    this.print(colors.cyan(colors.bold(colors.underline("Welcome to CenSQL for SAP HANA!\n\n\n"))));

    this.print(colors.yellow("Connecting to HANA..."))
}

/**
* The rest of the program is ready for user input, start listening on stdin
*/
ScreenManager.prototype.ready = function(hdb) {

    if (!this.isBatch) {
        this.clear()
    }

    /**
    * Should we enter the cli or studio mode?
    */
    if (this.settings.studio) {

        GLOBAL.graphWidth = process.stdout.columns / 1.5;

        this.graphics = new StudioGraphics(this);
        this.studio = new StudioSession(this, hdb, this.commandHandler);
    } else {

        GLOBAL.graphWidth = process.stdout.columns;

        this.print(colors.cyan(colors.bold("For help type \\h\n-----------------------------------------------------\n\n")));
        this.print(colors.cyan("> "));
        process.stdin.resume();
    }

}

ScreenManager.prototype.printCommandOutput = function(command, outputs, callback) {
    this.renderCommandOutput(command, outputs, function(err, lines) {

        this.renderLines([].concat.apply([], lines), function() {

            /**
            * Dont display a prompt for batch requests
            */
            if (!this.isBatch) {
                this.print("\n" + colors.cyan("> "));
            }

            callback();

        }.bind(this))

    }.bind(this));
}

/**
* Print the output to a command entered by the user
* @param  {String} command The command the user ran
* @param  {Array} outputs  the data and how to display it
*/
ScreenManager.prototype.renderCommandOutput = function(command, outputs, callback) {

    var cSegs = command.split("||");

    var initialCommand = "";

    /**
    * The parts of the command
    * @type {String[]}
    */
    var cParts = [];

    var hasReachedPipe = false;

    for (var i = 0; i < cSegs.length; i++) {
        var splitOnPipes = cSegs[i].split(/[^\\]\|/);

        // console.log(splitOnPipes)

        if (!hasReachedPipe) {

            if (splitOnPipes.length > 1) {

                hasReachedPipe = true;

                initialCommand += splitOnPipes[0];

                splitOnPipes.shift()

            } else {

                initialCommand += cSegs[i];

                if (i + 1 < cSegs.length) {
                    initialCommand += " || ";
                }

            }
        }

        if (hasReachedPipe) {
            cParts = cParts.concat(splitOnPipes);
        }

    };

    cParts.unshift(initialCommand);

    async.mapSeries(outputs, function(output, callback) {

        /**
        * Pass the data to the chosen formatter
        */
        var lines = this.formatters[output[3]](output[0], output[2], output[4], this.settings, output[5], output[6], output[7]);
        callback(null, this.processPipes(lines, cParts, this.settings));

    }.bind(this), function(err, lines) {

        callback(err, lines);

    }.bind(this))

}

/**
* Send the data through all the piped commands they added
*/
ScreenManager.prototype.processPipes = function(linesIn, commandParts) {

    var linesOut = linesIn.slice(0);

    for (var j = 1; j < commandParts.length; j++) {

        var commandName = commandParts[j].trim().split(" ")[0].toLowerCase();

        if (!this.pipeHandlers[commandName]) {
            linesOut = ["Unknown command: " + commandName + ". try \\h for help"];
            continue;
        }

        linesOut = this.pipeHandlers[commandName](linesOut, commandParts[j])

    }

    return linesOut;

}

/**
* Draw the data line by line, removing colour if the user requested no colour
*/
ScreenManager.prototype.renderLines = function(lines, callback) {
    async.mapSeries(lines, function(line, callback) {
        this.print(line + "\n", callback);
    }.bind(this), callback ? callback : null);
}

ScreenManager.prototype.error = function(message) {
    this.print(colors.red(message));
}

ScreenManager.prototype.print = function(message, callback) {
    if (!this.settings.colour) {
        process.stdout.write(stripColorCodes(message || "NULL"), callback ? callback : null);
    } else {
        process.stdout.write(message || "NULL", callback ? callback : null);
    }
}

ScreenManager.prototype.clear = function() {
    charm.erase("screen");
    this.goto(1, 1);
}

ScreenManager.prototype.goto = function(x, y) {
    charm.position(x, y);
}

module.exports = ScreenManager;
