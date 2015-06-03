var debug = require("debug")("censql:ScreenManager");
var readline = require('readline');
var charm = require('charm')(process.stdout)

var ScreenManager = function(commandHandler) {
    this.commandHandler = commandHandler;
    this.init.call(this);
}

ScreenManager.prototype.init = function() {
    this.printHeader();

    this.setupInput();
}

ScreenManager.prototype.setupInput = function() {
    rl = readline.createInterface(process.stdin, process.stdout);

    rl.on('line', function(line) {

        charm.up(1);
        charm.erase("line");
        charm.left(99999);

        process.stdin.pause();

        this.commandHandler.handleCommand(line, function(output) {
            this.printCommandOutput(line, output);
        }.bind(this));

    }.bind(this)).on('close', function() {

        charm.foreground("green");
        charm.write('\nHave a great day!\n');
        charm.foreground("white");

        rl.close();
        process.exit(0);
    });
}

ScreenManager.prototype.printHeader = function() {
    // charm.erase("screen");
    // charm.position(0, 0)

    charm.foreground("cyan");
    charm.display("underscore");
    charm.display("bright");

    charm.write("Welcome to CenSQL for SAP HANA!\n\n");

    charm.display("reset");

    charm.foreground("yellow");

    charm.write("Connecting to HANA...");

    process.stdin.pause();

}

ScreenManager.prototype.ready = function() {

    charm.erase("line");
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

ScreenManager.prototype.printCommandOutput = function(command, output) {

    process.stdin.resume();

    charm.foreground(output[0] == 0 ? "green" : "red");
    charm.write("> " + command + "\n\n");

    if (output[0] == 0) {

        switch (output[2]) {
            case "message":
                charm.write(output[1] + "\n\n");
                break;
            case "table":
                this.drawTable(output[1]);
                break;
            case "group":
                this.drawGroup(output[1]);
                break;
            case "json":
                charm.write(JSON.stringify(output[1]) + "\n\n")
                break;
            default:
                charm.write("NO DISPLAY TYPE: " + output[1] + "\n\n");
                break;
        }

    } else {

        switch (output[2]) {
            case "message":
                charm.write(output[1] + "\n\n");
                break;
            case "table":
                this.drawTable(output[1]);
                break;
            case "json":
                charm.write(JSON.stringify(output[1]) + "\n\n")
                break;
            default:
                charm.write("NO DISPLAY TYPE: " + output[1] + "\n\n");
                break;
        }

    }

    charm.foreground("cyan");
    charm.write("> ");
    charm.display("reset");
}

ScreenManager.prototype.drawTable = function(data) {
    for (var i = data.length - 1; i >= 0; i--) {

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);

            charm.write(keys.join(" | "))
            charm.write("\n" + new Array(10).join("- ") + "\n");
        } else {
            charm.write("No Results\n");
        }

        keys.reverse()

        for (var k = data[i].length - 1; k >= 0; k--) {
            var rows = [];

            for (var j = keys.length - 1; j >= 0; j--) {
                rows.push(data[i][k][keys[j]])
            };

            charm.write(rows.join(" | ") + "\n");
            // charm.write(new Array(10).join("- ") + "\n");
        };
    };

    charm.write("\n");
}

ScreenManager.prototype.drawGroup = function(data) {
    for (var i = data.length - 1; i >= 0; i--) {

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);
        } else {
            charm.write("No Results\n");
        }

        keys.reverse()

        for (var k = 0; k < data[i].length; k++) {

            charm.write("No: " + k + " " + new Array(10).join("-") + "\n");
            
            for (var j = keys.length - 1; j >= 0; j--) {
                charm.write(" " + keys[j] + ": " + data[i][k][keys[j]] + "\n")
            };

        };
    };

    charm.write("\n");
}

module.exports = ScreenManager;
