
module.exports = function(data) {

    var renderedLines = [];

    for (var i = 0; i < data.length; i++) {

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);

            renderedLines.push(keys.join(" | "))
            renderedLines.push(new Array(20).join("- "));
        } else {
            renderedLines.push("No Results\n");
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

    return renderedLines;
}