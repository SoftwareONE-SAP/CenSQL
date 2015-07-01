var colors = require("colors");

module.exports = function(data, title, settings) {

    var lines = [];

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
             * Start making plot
             */

            var plot = []

            for (var k = 0; k < settings.plotHeight + 1; k++) {
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

                var val = parseInt(((data[i][k][keys[4]] - minValue) / (maxValue - minValue)) * settings.plotHeight);

                for (var j = 0; j < settings.plotHeight + 1; j++) {

                    var point = "·"


                    if (j == settings.plotHeight - val) {
                        point = "■"
                    }

                    plot[j].push(point);
                }

            }

            /**
             * Display plot
             */

            /**
             * Build the header line for the graph
             */
            var widthRatio = Math.floor((process.stdout.columns - 3) / plot[0].length);

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
            for (var k = 0; k < plot.length; k++) {

                plot[k].reverse()

                var line = colors.green("║");

                for (var o = 0; o < plot[k].length; o++) {
                    for (var w = 0; w < widthRatio; w++) {

                        if (plot[k][o] === "■") {
                            plot[k][o] = colors.cyan(plot[k][o])
                        } else {
                            plot[k][o] = colors.magenta(plot[k][o])
                        }

                        line += plot[k][o];

                        plot[k][o] = colors.green(plot[k][o])
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