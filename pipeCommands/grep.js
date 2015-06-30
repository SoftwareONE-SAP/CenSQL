
module.exports = function(linesIn, command){
    var linesOut = linesIn.slice(0);

    var part = command.trim();
    var parts = part.split(" ");

    var isInverse = false;

    if(parts[1] && parts[1].trim() == "-i"){
        isInverse = true;
    }

    var i = linesOut.length;
    while (i--) {

        if(isInverse){

            if(linesOut[i].indexOf(part.substring(part.indexOf('-i ') + 3)) !== -1){
                linesOut.splice(i, 1);
            }

        }else{

            if(linesOut[i].indexOf(part.substring(part.indexOf(' ') + 1)) === -1){
                linesOut.splice(i, 1);
            }

        }

    }   


    return linesOut;
}
