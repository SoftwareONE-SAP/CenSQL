var colors = require("colors");

module.exports = function(command, data, title, settings) {

    var lines = [];

    var barTypes = ["█", "░", "▒", "▓"]

    var ccolours = ['green', 'cyan', 'red', 'yellow', 'blue', 'magenta'];

    /**
     * get keys
     */
    var keys = [];

    if (data.length > 0) {

        keys = Object.keys(data[0]);
    } else {
        lines.push("No Results");
        lines.push("");
        return lines;
    }

    for (var k = 0; k < data.length; k++) {

        var sum = 0;

        sum += data[k][keys[1]]
        sum += data[k][keys[2]]

        lines.push(colors.white(title + " - " + data[k][keys[0]]));

        for (var s = 0; s < settings.barHeight; s++) {
            // console.log(s)

            var dataLine = "";

            var width = Math.floor(process.stdout.columns * data[k][keys[1]] / sum);

            if(sum == 0){
                width = 0;
            }

            dataLine += colors[ccolours[1]](new Array(width).join(barTypes[0]));

            width = Math.floor(process.stdout.columns * data[k][keys[2]] / sum);

            if(sum == 0){
                width = process.stdout.columns;
            }

            dataLine += colors[ccolours[0]](new Array(width).join(barTypes[1]));

            lines.push(dataLine);

        }

        lines.push("");
    }

    lines.push(colors.white("- ") + colors[ccolours[1]](keys[1]));

    lines.push(colors.white("- ") + colors[ccolours[0]](keys[2]));


    return lines;
}