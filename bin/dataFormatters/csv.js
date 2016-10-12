
module.exports = function(command, data, title, screen) {

    var delim = screen.settings.csv.delimeter;
    var lines = [];
    var keys = [];

    if (data && data.length > 0) {

        keys = Object.keys(data[0]);

        lines.push(keys.join(delim))
    } else {
        lines.push("No Results\n");
        return lines;
    }

    keys.reverse()

    for (var k = 0; k < data.length; k++) {
        var row = [];

        for (var j = keys.length - 1; j >= 0; j--) {

            var value = data[k][keys[j]];

            value = ("" + value).split('"').join('""').split("\n").join("\\n").split("\r").join("\\r");

            if(value.indexOf(delim) !== -1){
                value = '"' + value + '"';
            }

            row.push(value)
        };

        var rowString = row.join(delim);

        lines.push(rowString);

    };

    return lines;
}