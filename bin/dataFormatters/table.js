var Table = require('cli-table3');

module.exports = function(command, data, title, screen) {

    if (!data || data.length == 0 || !data[0]) {
        return ["No Results"];
    }

    var keys = Object.keys(data[0]);

    var table = new Table({
        head: keys,
        chars: screen.cci.tableChars,
        truncate: false
    });

    for (var k = 0; k < data.length; k++) {
        var row = [];

        for (var j = 0; j < keys.length; j++) {
            
            var value = data[k][keys[j]];

            if(value == null) value = "NULL";

            if(value instanceof Buffer){
                value = value.toString("utf8");
            }

            row.push(value)
        };

        table.push(row);
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