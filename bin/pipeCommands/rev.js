var stripAnsi = require('strip-ansi');

module.exports = function(linesIn, command) {

    var linesOut = [];

    for (var i = 0; i < linesIn.length; i++) {
        linesOut[i] = stripAnsi(linesIn[i]).split('').reverse().join('');
    }

    return linesOut;
}
