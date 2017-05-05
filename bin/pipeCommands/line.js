var colors = require("colors");

module.exports = function(linesIn, command, screen) {

    var filledPointChar = screen.cci.codes.block_solid;
    var emptyChar = "-";

    /**
     * Check for empty input
     */
    if (!linesIn || linesIn.length == 0 || !linesIn[0]) {
        return [];
    }

    /**
     * Generate data points
     */

    var points = [];

    for (var i = 0; i < linesIn.length; i++) {
        var num = Number(linesIn[i])

        if (isNaN(num)) {
            num = 0;
        }

        points[i] = num;

    }

    /**
     * Get min/max variables
     */
    var argv = require('optimist')(command.trim().split(" ")).argv;

    var min = Number.MAX_VALUE;
    var max = Number.MIN_VALUE;

    for (var i = 0; i < points.length; i++) {
        if (points[i] > max) max = points[i];
        if (points[i] < min) min = points[i];
    }

    /**
     * Override values if provided by user
     */

    if ("min" in argv) {
        min = argv.min;
    }

    if ("max" in argv) {
        max = argv.max;
    }

    /**
     * normalise values into percent of graph
     */

    for (var i = 0; i < points.length; i++) {
        points[i] = points[i] - min;
    }


    var biggest = max - min;

    for (var i = 0; i < points.length; i++) {
        points[i] = parseInt((points[i] / biggest) * (screen.settings.plotHeight - 1));
    }

    /**
     * Start generating graph
     */
    var output = [];

    for (var i = 0; i < points.length; i++) {
        output[i] = new Array(screen.settings.plotHeight + 1).join(emptyChar).split("");
    }

    for (var i = 0; i < points.length; i++) {

        if (points[i] < 0) {
            continue;
        }

        if (points[i] > screen.settings.plotHeight) {
            continue;
        }


        output[i][points[i]] = filledPointChar;
    }

    /**
     * generate raw output
     */

    var lines = [];

    for (var i = 0; i < screen.settings.plotHeight; i++) {
        lines[i] = [];
    }

    for (var i = 0; i < points.length; i++) {
        for (var k = 0; k < screen.settings.plotHeight; k++) {
            lines[k].push(output[i][k])
        }
    }

    /**
     * Add colours
     */
    
    for(var l = 0; l < lines.length; l++){
        for (var c = 0; c < lines[l].length; c++) {
            if(lines[l][c] == emptyChar){
                lines[l][c] = colors.magenta(lines[l][c]);
            }else{
                lines[l][c] = colors.cyan(lines[l][c]);
            }
        }
    }

    /**
     * Flip the right way up
     */

    lines = lines.reverse()

    for (var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].reverse().join("");
    }

    return lines;
}