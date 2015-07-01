
module.exports = function(data) {

    var renderedLines = [];

    for (var i = 0; i < data.length; i++) {

        /**
         * get keys
         */

        var keys = [];

        if (data[i].length > 0) {

            keys = Object.keys(data[i][0]);
        } else {
            renderedLines.push("No Results\n");
            continue;
        }

        keys.reverse()

        /**
         * Display data
         */

        for (var k = 0; k < data[i].length; k++) {

            renderedLines.push("No: " + k + " " + new Array(20).join("-"));

            for (var j = keys.length - 1; j >= 0; j--) {
                renderedLines.push(" " + keys[j] + ": " + data[i][k][keys[j]]);
            };

        };

    };

    return renderedLines;
}