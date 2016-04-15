
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
        var row = [];

        for (var j = keys.length - 1; j >= 0; j--) {

            var value = data[k][keys[j]];

            value = ("" + value).split('"').join('""');

            if(value.indexOf(",") !== -1){
                value = '"' + value + '"';
            }

            row.push(value)
        };

        var rowString = row.join(",");

        lines.push(rowString);

    };

    return lines;
}