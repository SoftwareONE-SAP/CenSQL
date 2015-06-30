
module.exports = function(linesIn, command){
    var linesOut = linesIn.slice(0);

    var part = command.trim();
    var parts = part.split(" ");

    var limit = parseInt(parts[1]);

    var limit = parseInt(parts[1]);

    var dir = parts[1][0] == "-";

    var amount = parseInt(parts[1].replace("-", ""));

    var i = linesOut.length;
    while (i--) {

        if(dir){
            linesOut[i] = linesOut[i].slice(0, amount);
        }else{
            linesOut[i] = linesOut[i].slice(amount - 1, linesOut[i].length);
        }

    }

    return linesOut;
}