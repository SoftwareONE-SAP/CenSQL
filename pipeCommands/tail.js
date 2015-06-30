
module.exports = function(linesIn, command){
    var linesOut = linesIn.slice(0);

    var part = command.trim();
    var parts = part.split(" ");

    var limit = parseInt(parts[1]);

    var limit = parseInt(parts[1]);

    var i = linesOut.length;
    while (i--) {
        if(linesOut.length - i > limit){
            linesOut.splice(i, 1);
        }
    }  

    return linesOut;
}
