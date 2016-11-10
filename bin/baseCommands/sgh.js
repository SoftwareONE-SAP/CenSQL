
var SetGraphHeightCommandHandler = function(){
	this.includeInAudit = false
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

	screen.settings.save();

	callback([0, "Graph height set to: " + (screen.settings.plotHeight + 1), "message"]);
}

module.exports = SetGraphHeightCommandHandler;