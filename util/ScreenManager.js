var readline = require('historic-readline');
var charm = require('charm')(process.stdout);
var colors = require("colors");
var path = require('path');
var stripColorCodes = require('stripcolorcodes');
var osHomedir = require('os-homedir');

var ScreenManager = function(isBatch, settings, commandHandler) {
    this.isBatch = isBatch;

    this.settings = settings;

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

    this.loadDataFormatters();
    this.loadPipeHandlers();

    this.setupInput();
}

ScreenManager.prototype.loadPipeHandlers = function() {
    this.handlers = {};

    require('fs').readdirSync(path.join(__dirname, '/../pipeCommands/')).forEach(function(file) {

        if (file.match(/\.js$/) !== null) {

            var name = file.replace('.js', '');

            this.handlers[name] = require('../pipeCommands/' + file);

        }

    }.bind(this));

}

ScreenManager.prototype.loadDataFormatters = function() {
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

    if (!process.stdout.isTTY) {

        /**
         * Spoof the width of the temrinal
         */
        process.stdout.columns = 80;

        process.stdout.on('error', function(err) {
            if (err.code == "EPIPE") {
                process.exit(0);
            }
        })

        return;
    }

    readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        path: path.join(osHomedir(), ".censql", "censql_hist"),
        maxLength: 100,
        next: function(rl) {
            this.rl = rl;

            this.rl.on('line', function(line) {

                if (GLOBAL.censql.RUNNING_PROCESS) return;

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

                GLOBAL.censql.RUNNING_PROCESS = true;

                /**
                 * Dont print the command if it was a batch command
                 */
                if (!this.isBatch) {
                    console.log("> " + line + "\n");
                }

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
                this.commandHandler.handleCommand(line, function(output) {

                    /**
                     * Print the command to the screen however the command handler thinks is best
                     */
                    this.printCommandOutput(line, output);

                    /**
                     * Reset running app state
                     * @type {Boolean}
                     */
                    GLOBAL.censql.RUNNING_PROCESS = false;
                    GLOBAL.SHOULD_EXIT = false;

                    /**
                     * Reset the keypress function for stdin
                     */
                    process.stdin._events.keypress = process.stdin._events._keypress_full;

                }.bind(this));

            }.bind(this));

            /**
             * On close, give the user a pretty message and then stop the entire program
             */
            this.rl.on('close', function() {

                this.print(colors.green('\nHave a great day!\n'));

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

    process.stdin.pause();

}

/**
 * The rest of the program is ready for user input, start listening on stdin
 */
ScreenManager.prototype.ready = function() {

    charm.up(1);
    charm.erase("line");

    /**
     * Todo: allow for teminals more than 9999999 chars wide
     */
    charm.left(9999999);

    this.print(colors.cyan(colors.bold("For help type \\h\n-----------------------------------------------------\n\n")));
    this.print(colors.cyan("> "));

    process.stdin.resume();
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

    /**
     * Split command part by unescaped pipes
     */
    var commandParts = command.replace(/([^\\])\|/g, "$1$1|").split(/[^\\]\|/);

    for (var i = 0; i < output.length; i++) {
        if (output[i][2] !== null) {

            /**
             * Pass the data to the chosen formatter
             */
            var lines = this.formatters[output[i][2]](commandParts[0], output[i][1], output[i][3], this.settings, output[i][4], output[i][5], output[i][6]);
            var pipedLines = this.processPipes(lines, commandParts, this.settings);
            this.renderLines(pipedLines);

        }
    };

    /**
     * Dont display a prompt for batch requests
     */
    if (!this.isBatch) {
        this.print(colors.cyan("> "));
    }
}

/**
 * Send the data through all the piped commands they added
 */
ScreenManager.prototype.processPipes = function(linesIn, commandParts) {

    var linesOut = linesIn.slice(0);

    for (var j = 1; j < commandParts.length; j++) {

        var commandName = commandParts[j].trim().split(" ")[0].toLowerCase();

        if (!this.handlers[commandName]) {
            linesOut = ["Unknown command: " + commandName + ". try \\h for help"];
            continue;
        }

        linesOut = this.handlers[commandName](linesOut, commandParts[j])

    }

    return linesOut;

}

/**
 * Draw the data line by line, removing colour if the user requested no colour
 */
ScreenManager.prototype.renderLines = function(lines) {

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        if (!this.settings.colour) {
            line = stripColorCodes(line);
        }

        console.log(line);

    }
}

ScreenManager.prototype.error = function(message) {
    this.print(colors.red(message));
}

ScreenManager.prototype.print = function(message) {
    if (!this.settings.colour) {
        process.stdout.write(stripColorCodes(message));
    } else {
        process.stdout.write(message);
    }
}

module.exports = ScreenManager;