var colors = require("colors");
var moment = require("moment");

module.exports = function(data, title, settings, graphWidth) {

    var lines = [];
    var emptyPointChar = "·";
    var filledPointChar = "■";

    for (var i = 0; i < data.length; i++) {

        /**
         * get keys
         */

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);
        } else {
            lines.push("No Results!");
            lines.push("");
            lines.push("");
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
             * Get the time between the first and last point
             */
            
            var maxTime = 0;
            var minTime = Number.MAX_VALUE;

            for (var k = 0; k < data[i].length; k++) {

                var diff = moment(data[i][k][keys[5]]).format("x");

                if(maxTime < diff) maxTime = diff;
                if(minTime > diff) minTime = diff;

            }

            var totalTimeDiff = maxTime - minTime;

            /**
             * Create empty plot
             */

            var plot = []

            /**
             * Build an empty graph
             */
            for(var y = 0; y < settings.plotHeight + 1; y++){

                plot[y] = [];

                for (var x = 0; x < graphWidth + 1; x++) {

                    plot[y][x] = emptyPointChar;
                }
            }

            /**
             * Start creating graph
             */

            for (var k = 0; k < data[i].length; k++) {

                if (data[i][k][keys[3]] !== sections[s]) continue;

                var val = parseInt(((data[i][k][keys[4]] - minValue) / (maxValue - minValue)) * settings.plotHeight);

                var groundedTiem = moment(data[i][k][keys[5]]).format("x") - totalTimeDiff;
                var percentInGraph = Math.floor(((maxTime - moment(data[i][k][keys[5]]).format("x")) / totalTimeDiff) * graphWidth)

                plot[val][percentInGraph] = filledPointChar;

            }

            /**
             * Display plot
             */

            var widthRatio = Math.floor((process.stdout.columns - 3) / graphWidth);

            /**
             * Build the header line for the graph
             */

            if (widthRatio < 1) {
                widthRatio = 1;
            }

            var headerLine = "";

            headerLine += "╔" + maxValue

            for (var k = 0; k < (plot[0].length * widthRatio) - ("" + maxValue).length; k++) {
                headerLine += "═"
            };

            headerLine += "╗";

            lines.push(colors.green(headerLine));

            /**
             * Build the data lines
             */
            for (var y = 0; y < settings.plotHeight; y++) {

                var line = colors.green("║");

                for (var o = 0; o < plot[y].length; o++) {
                    for (var w = 0; w < widthRatio; w++) {

                        if (plot[y][o] === "■") {
                            plot[y][o] = colors.cyan(plot[y][o])
                        } else {
                            plot[y][o] = colors.magenta(plot[y][o])
                        }

                        line += plot[y][o];

                        plot[y][o] = colors.green(plot[y][o])
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

            var xPadding = 2 + parseInt(((plot[0].length * widthRatio) - description.length) / 2);

            lines.push(new Array(xPadding).join(" ") + description);

            lines.push("");

        }

    }

    return lines;
}