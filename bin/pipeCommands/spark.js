var sparkline = require('sparkly');

module.exports = function(linesIn, command, screen) {

    if (!linesIn || linesIn.length == 0 || !linesIn[0]) {
        return [];
    }

    var items = [];

    for (var i = 0; i < linesIn.length; i++) {
        var num = Number(linesIn[i])


        if (isNaN(num)) {
            num = 0;
        }

        items.push(num);
    }

    /**
     * Get command args
     */
    var argv = require('optimist')(command.trim().split(" ")).argv;

    var ops = {
        style: "fire"
    };

    if (!argv.rev && !argv.reverse) {
        items = items.reverse()
    }

    if (argv.min) {
        ops.min = parseInt(argv.min);
    }

    if (argv.max) {
        ops.max = parseInt(argv.max);
    }

    return [sparkline(items, ops)];
}