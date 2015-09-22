
module.exports = function(command, data) {

    var renderedLines = [];

    for (var i = 0; i < data.length; i++) {

        var keys = [];

        if (data[i] && data[i].length > 0) {

            keys = Object.keys(data[i][0]);

            renderedLines.push(keys.join(" | "))
            renderedLines.push(new Array(20).join("- "));
        } else {
            renderedLines.push("No Results\n");
            continue;
        }

        keys.reverse()

        for (var k = 0; k < data[i].length; k++) {
            var rows = [];

            for (var j = keys.length - 1; j >= 0; j--) {
                rows.push(data[i][k][keys[j]])
            };

            var rowString = rows.join(" | ");

            renderedLines.push(rowString);

        };

    };

    // Add an empty line onto the end of the output
    renderedLines.push("")

    return renderedLines;
}