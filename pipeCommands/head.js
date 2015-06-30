
module.exports = function(linesIn, command){
	var linesOut = linesIn.slice(0);

	var part = command.trim();
    var parts = part.split(" ");

    var limit = parseInt(parts[1]);

    var i = linesOut.length;
    while (i--) {
        if(i > limit - 1){
            linesOut.splice(i, 1);
        }
    }  

	return linesOut;
}
