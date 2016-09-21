var Table = require('cli-table');

module.exports = function(command, data, title, screen) {

    var lines = [];

    if (!data || data.length == 0 || !data[0]) {
        lines.push("No Results\n");
        return lines;
    }

    var keys = Object.keys(data[0]);

    var table = new Table({
        head: keys,
        chars: screen.cci.tableChars,
        truncate: false
    });

    // table.push(data);

    for (var k = 0; k < data.length; k++) {
        var rows = [];

        for (var j = 0; j < keys.length; j++) {
            
            var value = data[k][keys[j]];

            if(value == null) value = "NULL";

            rows.push(value)
        };

        table.push(rows);
    };

    return table.toString().split("\n");
}

// Old non utf8 version
// module.exports = function(command, data) {

//     var lines = [];

//     var keys = [];

//     if (data && data.length > 0) {

//         keys = Object.keys(data[0]);

//         lines.push(keys.join(" | "))
//         lines.push(new Array(20).join("- "));
//     } else {
//         lines.push("No Results\n");
//         return lines;
//     }

//     keys.reverse()

//     for (var k = 0; k < data.length; k++) {
//         var rows = [];

//         for (var j = keys.length - 1; j >= 0; j--) {
//             rows.push(data[k][keys[j]])
//         };

//         var rowString = rows.join(" | ");

//         lines.push(rowString);

//     };

//     return lines;
// }