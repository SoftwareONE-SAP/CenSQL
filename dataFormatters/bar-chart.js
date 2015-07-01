var colors = require("colors");

module.exports = function(data, title) {

    var lines = [];

    var barTypes = ["█", "░", "▒", "▓"]

    var ccolours = ['green', 'cyan', 'red', 'yellow', 'blue', 'magenta'];

    for (var i = 0; i < data.length; i++) {

        /**
         * get keys
         */

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);
        } else {
            lines.push("No Results");
            lines.push("");
            continue;
        }

        for (var k = 0; k < data[i].length; k++) {

            var sum = 0;

            sum += data[i][k][keys[1]]
            sum += data[i][k][keys[2]]

            var dataLine = "";

            lines.push(colors.white(title + " - " + data[i][k][keys[0]]));

            var width = parseInt(process.stdout.columns * data[i][k][keys[1]] / sum);

            dataLine += colors[ccolours[1]](new Array(width).join(barTypes[0]));

            width = parseInt(process.stdout.columns * data[i][k][keys[2]] / sum);

            dataLine += colors[ccolours[0]](new Array(width).join(barTypes[1]));

            lines.push(dataLine);

            lines.push("");
        }

        lines.push(colors.white("- ") + colors[ccolours[1]](keys[1]));

        lines.push(colors.white("- ") + colors[ccolours[0]](keys[2]));

    }

    return lines;
}