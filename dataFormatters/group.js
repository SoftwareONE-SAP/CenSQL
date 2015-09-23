module.exports = function(command, data) {

    var renderedLines = [];

    /**
     * get keys
     */
    var keys = [];

    if (data.length > 0) {

        keys = Object.keys(data[0]);
    } else {
        renderedLines.push("No Results\n");
        return lines;
    }

    keys.reverse()

    /**
     * Display data
     */

    for (var k = 0; k < data.length; k++) {

        renderedLines.push("No: " + k + " " + new Array(20).join("-"));

        for (var j = keys.length - 1; j >= 0; j--) {
            renderedLines.push(" " + keys[j] + ": " + data[k][keys[j]]);
        };

    };

    return renderedLines;
}