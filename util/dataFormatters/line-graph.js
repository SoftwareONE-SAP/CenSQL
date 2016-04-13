var colors = require("colors");
var moment = require("moment");

module.exports = function(command, data, title, settings, amountOfHours) {

    var lines = [];
    var emptyPointChar = "-";
    var filledPointChar = "■";
    // amountOfHours = amountOfHours + 1;

    /**
     * get keys
     */
    var keys = [];

    if (data.length > 0) {

        keys = Object.keys(data[0]);
    } else {
        lines.push("No Results!");
        lines.push("");
        return lines;
    }


    /**
     * Get sections. eg hostnames
     */

    var sections = [];

    for (var k = 0; k < data.length; k++) {

        if (sections.indexOf(data[k][keys[4]]) === -1) {
            sections.push(data[k][keys[4]]);
        }

    }

    sections.sort();

    /**
     * Create the times for all the data
     */
    for (var k = 0; k < data.length; k++) {
        data[k].timeDate = new Date(data[k][keys[0]], data[k][keys[1]], data[k][keys[2]], data[k][keys[3]], 0, 0, 0)
        data[k].timeDateEpoch = data[k].timeDate.getTime();
    }

    for (var s = 0; s < sections.length; s++) {

        /**
         * Get min an max values
         */
        var maxValue = 0;
        var minValue = Number.MAX_VALUE;

        if(!settings.relativeGraphs && command.indexOf("-r") == -1){
            minValue = 0;
        }

        for (var k = 0; k < data.length; k++) {

            if (maxValue < data[k][keys[5]]) maxValue = data[k][keys[5]];
            if (minValue > data[k][keys[5]]) minValue = data[k][keys[5]];

        }

        if (maxValue == minValue) {
            maxValue++;
            minValue--;
        }

        /**
         * Get the time between the first and last point
         */

        var maxTime = 0;

        for (var k = 0; k < data.length; k++) {
            if (maxTime < data[k].timeDateEpoch) maxTime = data[k].timeDateEpoch;
            // if (minTime > data[k].timeDateEpoch) minTime = data[k].timeDateEpoch;
        }

        var totalTimeDiff = amountOfHours * 60 * 60 * 1000;

        var minTime = maxTime - totalTimeDiff;


        /**
         * Create empty plot
         */

        var plot = []

        /**
         * Build an empty graph
         */
        for (var y = 0; y < settings.plotHeight + 1; y++) {

            plot[y] = [];

            for (var x = 0; x < amountOfHours; x++) {

                plot[y][x] = emptyPointChar;
            }
        }

        var count = 0;

        /**
         * Start creating graph
         */
        for (var k = data.length - 1; k >= 0; k--) {

            if (data[k][keys[4]] !== sections[s]) continue;

            var val = settings.plotHeight - parseInt(((data[k][keys[5]] - minValue) / (maxValue - minValue)) * settings.plotHeight);
            // var percentInGraph = parseInt(((maxTime - data[k].timeDateEpoch) / totalTimeDiff) * (amountOfHours + 1))

            // var percentInGraph = parseInt((((maxTime - minTime) - (data[k].timeDateEpoch - minTime)) / 100) * amountOfHours)

            plot[val][count] = filledPointChar;

            count++;

        }

        /**
         * Add padding if needed
         */
        var maxLength = 0;
        for (var k = 0; k < plot.length; k++) {
            if(plot[k].length > maxLength){
                maxLength = plot[k].length;
            }
        };

        for (var k = 0; k < plot.length; k++) {
            if(plot[k].length < maxLength){
                plot[k].push(emptyPointChar)
            }
        }


        /**
         * Display plot
         */
        var widthRatio = Math.floor((GLOBAL.graphWidth - 3) / (amountOfHours - 1));

        /**
         * Build the header line for the graph
         */

        if (widthRatio < 1) {
            widthRatio = 1;
        }

        var headerLine = "";

        headerLine += "╔" + maxValue

        // return [plot[0].length]
        for (var k = 0; k < (plot[0].length * widthRatio) - ("" + maxValue).length; k++) {
            headerLine += "═"
        };

        headerLine += "╗";

        lines.push(colors.green(headerLine));


        /**
         * Build the data lines
         */
        for (var y = 0; y < plot.length; y++) {

            // plot[y].reverse();

            var line = colors.green("║");

            for (var o = 0; o < plot[y].length; o++) {
                for (var w = 0; w < widthRatio; w++) {

                    if (!plot[y][o]) plot[y][o] = "!"

                    if (plot[y][o] === filledPointChar) {
                        plot[y][o] = colors.cyan(plot[y][o])
                    } else {
                        plot[y][o] = colors.magenta(plot[y][o])
                    }

                    line += plot[y][o];

                    // plot[y][o] = colors.green(plot[y][o])
                }
            };

            line += colors.green("║");

            lines.push(line);

        };

        var footerLine = "╚" + minValue;

        for (var k = 0; k < (plot[0].length * widthRatio) - ("" + minValue).length; k++) {
            footerLine += "═";
        };

        footerLine += "╝";

        lines.push(colors.green(footerLine));

        var description = title + " - " + sections[s];

        var xPadding = 2 + Math.ceil(((plot[0].length * widthRatio) - description.length) / 2);

        lines.push(new Array(xPadding).join(" ") + description);

    }

    return lines;
}