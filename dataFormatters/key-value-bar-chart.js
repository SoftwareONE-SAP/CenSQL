var colors = require("colors");

module.exports = function(data, title) {

	var lines = [];

    var barTypes = ["█", "░", "▒", "▓"]

    var parts = [];

    var ccolours = ['cyan', 'green', 'red', 'yellow', 'blue', 'magenta'];

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

            lines.push(colors.white(title + " - " + sections[s]))

            var dataLine = "";

            for (var k = 0; k < data[i].length; k++) {

                if (data[i][k][keys[0]] !== sections[s]) continue;

                var width = parseInt(process.stdout.columns * data[i][k][keys[2]] / sum);

                dataLine += colors[ccolours[parts.indexOf(data[i][k][keys[1]])]](new Array(width).join(barTypes[parts.indexOf(data[i][k][keys[1]]) % 4]));

            }

            lines.push(dataLine);

            lines.push("");

        }

        for (var k = 0; k < parts.length; k++) {

            lines.push("- " + colors[ccolours[k]](parts[k]))
        }


    }

    return lines;
}