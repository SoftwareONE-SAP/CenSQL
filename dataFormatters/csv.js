
module.exports = function(command, data) {

    var lines = [];

    var keys = [];

    if (data && data.length > 0) {

        keys = Object.keys(data[0]);

        lines.push(keys.join(","))
    } else {
        lines.push("No Results\n");
        return lines;
    }

    keys.reverse()

    for (var k = 0; k < data.length; k++) {
        var rows = [];

        for (var j = keys.length - 1; j >= 0; j--) {
            rows.push(data[k][keys[j]])
        };

        var rowString = rows.join(",");

        lines.push(rowString);

    };

    return lines;
}