var colors = require("colors");

module.exports = function(command, data, title, screen) {

    var lines = [];

    var barTypes = [screen.cci.codes.block_whole, screen.cci.codes.block_faded_min, screen.cci.codes.block_faded_mid, screen.cci.codes.block_faded_max]

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

        lines.push(colors.white((title ? title + " - " : "") + data[k][keys[0]]));

        for (var s = 0; s < screen.settings.barHeight; s++) {
            // console.log(s)

            var dataLine = "";

            var width = Math.floor(global.graphWidth * data[k][keys[1]] / sum);

            if(sum == 0){
                width = 0;
            }

            dataLine += colors[ccolours[1]](new Array(width).join(barTypes[0]));

            width = Math.floor(global.graphWidth * data[k][keys[2]] / sum);

            if(sum == 0){
                width = global.graphWidth;
            }

            dataLine += colors[ccolours[0]](new Array(width).join(barTypes[1]));

            lines.push(dataLine);

        }

        lines.push("");
    }

    if(keys[1] != "hidden") lines.push(colors.white("- ") + colors[ccolours[1]](keys[1]));

    if(keys[2] != "hidden") lines.push(colors.white("- ") + colors[ccolours[0]](keys[2]));

    return lines;
}