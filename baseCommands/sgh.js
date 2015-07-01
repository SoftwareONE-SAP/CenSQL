
var SetGraphHeightCommandHandler = function(){
	this.description = "";
}

SetGraphHeightCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	if(!cParts[1] || !cParts[1].match(/^\d+$/)){
        callback([1, "Syntax: \\sgh {HEIGHT}", "message"]);
        return;
	}

	screen.settings.plotHeight = parseInt(cParts[1]) - 1

	if(screen.settings.plotHeight < 0){
		screen.settings.plotHeight = 0;
	}

	callback([0, "Graph height set to: " + screen.settings.plotHeight, "message"]);
}

module.exports = SetGraphHeightCommandHandler;