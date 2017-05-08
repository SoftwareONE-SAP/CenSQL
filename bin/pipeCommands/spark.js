var sparkline = require('sparkline');

module.exports = function(linesIn, command){

    if (!linesIn || linesIn.length == 0 || !linesIn[0]) {
        return [];
    }

    var items = [];

    for (var i = 0; i < linesIn.length; i++) {
        var num = Number(linesIn[i])

        if(isNaN(num)){
            num = 0;
        }

        items.push();

    }

    return [sparkline(items).split("").reverse().join("")];
}