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

    /**
     * Has the suer tried to quit once?
     * @type {Boolean}
     */
    this.wantsToQuit = false;

    this.setupInput();
}

/**
 * Add an input handler to the cli and pass it to the commandHandler
 */
ScreenManager.prototype.setupInput = function() {
    readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        path: path.join(process.env.HOME, ".censql_hist"),
        maxLength: 0x10,
        next: function(rl){
            this.rl = rl;

            this.rl.on('line', function(line) {

            /**
             * The user has ran a command, reset the quit request
             * @type {Boolean}
             */
            this.wantsToQuit = false;

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
             * Send the suer command to the command handler
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

                /**
                 * If this si the second time in a row the user has tried to quit, lets actually quit
                 */
                if(this.wantsToQuit){

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
                    return
                }

                charm.erase("line");
                charm.left(99999);

                this.printCommandOutput("\\q", [2, "Press ^C again to exit", "message"]);

                this.wantsToQuit = true;

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

    var color = "cyan"

    /**
     * The colour the output should be
     */
    if(output[0] == 0){
        color = "green"
    }else if(output[0] == 1){
        color = "red"
    }else if(output[0] == 2){
        color = "yellow"
    }

    charm.foreground(color);

    /**
     * Dont print the command if it was a batch command
     */
    if (!this.isBatch) {
        charm.write("> " + command + "\n\n");
    }

    switch (output[2]) {

        /**
         * Plain text
         */
        case "message":
            charm.write(output[1] + "\n\n");
            break;

        /**
         * a table
         */
        case "table":
            this.drawTable(output[1]);
            break;

        /**
         * display each row in a key value chunk
         */
        case "group":
            this.drawGroup(output[1]);
            break;

        /**
         * turn the output array into json
         */
        case "json":
            charm.write(JSON.stringify(output[1]) + "\n\n")
            break;

        /**
         * display a line graph of the data
         */
        case "line-graph":
            this.drawLineGraph(output[1], output[3]);
            break;

        /**
         * Display a bar chart for data in a key value store
         */
        case "key-value-bar-chart":
            this.drawKeyValueBarChart(output[1], output[3]);
            break;

        /**
         * Display a bar chart of the data in a normal table structor
         */
        case "bar-chart":
            this.drawBarChart(output[1], output[3]);
            break;

        /**
         * If the command handler did not supply a valid format, print it as plain text
         */
        default:
            charm.write("NO DISPLAY TYPE: " + output[1] + "\n\n");
            break;
    }

    if (!this.isBatch) {
        charm.foreground("cyan");
        charm.write("> ");
    } else {
        charm.foreground("white");
    }

    charm.display("reset");
}

/**
 * Display an ascii table of data
 * @param  {Array} data
 */
ScreenManager.prototype.drawTable = function(data) {
    for (var i = 0; i < data.length; i++) {

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);

            charm.write(keys.join(" | "))
            charm.write("\n" + new Array(20).join("- ") + "\n");
        } else {
            charm.write("No Results\n");
        }

        keys.reverse()

        for (var k = 0; k < data[i].length; k++) {
            var rows = [];

            for (var j = keys.length - 1; j >= 0; j--) {
                rows.push(data[i][k][keys[j]])
            };

            charm.write(rows.join(" | ") + "\n");
            // charm.write(new Array(20).join("- ") + "\n");
        };

        charm.write("\n");
    };
}

/**
 * Display the data in the grouped format
 * @param  {Array} data
 */
ScreenManager.prototype.drawGroup = function(data) {
    for (var i = 0; i < data.length; i++) {

        /**
         * get keys
         */

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);
        } else {
            charm.write("No Results\n\n");
            continue;
        }

        keys.reverse()

        /**
         * Display data
         */

        for (var k = 0; k < data[i].length; k++) {

            charm.write("No: " + k + " " + new Array(20).join("-") + "\n");

            for (var j = keys.length - 1; j >= 0; j--) {
                charm.write(" " + keys[j] + ": " + data[i][k][keys[j]] + "\n")
            };

        };

        charm.write("\n");
    };
}

ScreenManager.prototype.drawLineGraph = function(data, title) {

    for (var i = 0; i < data.length; i++) {

        /**
         * get keys
         */

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);
        } else {
            charm.write("No Results\n\n");
            continue;
        }

        /**
         * Get sections
         */

        var sections = [];

        for (var k = 0; k < data[i].length; k++) {

            if (sections.indexOf(data[i][k][keys[3]]) === -1) {
                sections.push(data[i][k][keys[3]]);
            }

        }

        sections.sort();

        for (var s = 0; s < sections.length; s++) {

            /**
             * Start making plot
             */

            var plot = []

            for (var k = 0; k < this.settings.plotHeight + 1; k++) {
                plot.push([]);
            }

            /**
             * Get min an max values
             */

            var maxValue = 0;
            var minValue = Number.MAX_VALUE;

            for (var k = 0; k < data[i].length; k++) {

                if (maxValue < data[i][k][keys[4]]) maxValue = data[i][k][keys[4]];
                if (minValue > data[i][k][keys[4]]) minValue = data[i][k][keys[4]];

            }

            if (maxValue == minValue) {
                maxValue++;
                minValue--;
            }

            /**
             * Start creating graph
             */

            for (var k = 0; k < data[i].length; k++) {

                if (data[i][k][keys[3]] !== sections[s]) continue;

                var val = parseInt(((data[i][k][keys[4]] - minValue) / (maxValue - minValue)) * this.settings.plotHeight);

                for (var j = 0; j < this.settings.plotHeight + 1; j++) {

                    var point = "·"


                    if (j == this.settings.plotHeight - val) {
                        point = "■"
                    }

                    plot[j].push(point);
                }

            }

            /**
             * Display plot
             */

            var widthRatio = Math.floor((process.stdout.columns - 3) / plot[0].length);

            if (widthRatio < 1) {
                widthRatio = 1;
            }

            charm.write("╔" + maxValue)

            for (var k = 0; k < (plot[0].length * widthRatio) - ("" + maxValue).length; k++) {
                charm.write("═");
            };

            charm.write("╗\n");

            for (var k = 0; k < plot.length; k++) {

                plot[k].reverse()

                charm.write("║");

                for (var o = 0; o < plot[k].length; o++) {
                    for (var w = 0; w < widthRatio; w++) {

                        if (plot[k][o] === "■") {
                            charm.foreground("cyan");
                        } else {
                            charm.foreground("magenta");
                        }

                        charm.write(plot[k][o]);

                        charm.foreground("green");
                    }
                };

                charm.write("║\n");
            };

            charm.write("╚" + minValue);

            for (var k = 0; k < (plot[0].length * widthRatio) - ("" + minValue).length; k++) {
                charm.write("═");
            };

            charm.write("╝\n");

            var description = title + " - " + sections[s];

            var xPadding = 2 + parseInt(((plot[0].length * widthRatio) - description.length) / 2);

            charm.write(new Array(xPadding).join(" ") + description);

            charm.write("\n\n");

        }

    }
}

ScreenManager.prototype.drawKeyValueBarChart = function(data, title) {

    var barTypes = ["█", "░", "▒", "▓"]

    var parts = [];

    var colors = ['cyan', 'green', 'red', 'yellow', 'blue', 'magenta'];

    for (var i = 0; i < data.length; i++) {

        /**
         * get keys
         */

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);
        } else {
            charm.write("No Results\n\n");
            continue;
        }

        /**
         * Get sections
         */

        var sections = [];

        for (var k = 0; k < data[i].length; k++) {

            if (sections.indexOf(data[i][k][keys[0]]) === -1) {
                sections.push(data[i][k][keys[0]]);
            }

        }

        sections.sort();

        for (var s = 0; s < sections.length; s++) {

            var sum = 0;

            for (var k = 0; k < data[i].length; k++) {

                if (data[i][k][keys[0]] !== sections[s]) continue;

                sum += data[i][k][keys[2]]

                if (parts.indexOf(data[i][k][keys[1]]) === -1) {
                    parts.push(data[i][k][keys[1]])
                }

            }

            charm.foreground("white");
            charm.write(title + " - " + sections[s] + "\n");

            for (var k = 0; k < data[i].length; k++) {

                if (data[i][k][keys[0]] !== sections[s]) continue;

                var width = parseInt(process.stdout.columns * data[i][k][keys[2]] / sum);

                charm.foreground(colors[parts.indexOf(data[i][k][keys[1]])])

                charm.write(new Array(width).join(barTypes[parts.indexOf(data[i][k][keys[1]]) % 4]))

            }

            charm.write("\n\n");

        }

        for (var k = 0; k < parts.length; k++) {

            charm.foreground("white");

            charm.write("- ");

            charm.foreground(colors[k]);
            charm.write(parts[k] + "\n")
        }

        charm.foreground("green");
    }
}

ScreenManager.prototype.drawBarChart = function(data, title) {

    var barTypes = ["█", "░", "▒", "▓"]

    var colors = ['green', 'cyan', 'red', 'yellow', 'blue', 'magenta'];

    for (var i = 0; i < data.length; i++) {

        /**
         * get keys
         */

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);
        } else {
            charm.write("No Results\n\n");
            continue;
        }

        for (var k = 0; k < data[i].length; k++) {

            var sum = 0;

            sum += data[i][k][keys[1]]
            sum += data[i][k][keys[2]]


            charm.foreground("white");
            charm.write(title + " - " + data[i][k][keys[0]] + "\n");



            var width = parseInt(process.stdout.columns * data[i][k][keys[1]] / sum);

            charm.foreground(colors[1])

            charm.write(new Array(width).join(barTypes[0]))

            width = parseInt(process.stdout.columns * data[i][k][keys[2]] / sum);

            charm.foreground(colors[0])

            charm.write(new Array(width).join(barTypes[1]))


            charm.write("\n\n");



        }

        charm.foreground("white");

        charm.write("- ");

        charm.foreground(colors[1]);
        charm.write(keys[1] + "\n")

        charm.foreground("white");

        charm.write("- ");

        charm.foreground(colors[0]);
        charm.write(keys[2] + "\n")

        charm.foreground("green");
    }
}

module.exports = ScreenManager;