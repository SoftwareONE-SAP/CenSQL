
var SetBarHeightCommandHandler = function(){
	this.includeInAudit = false
}

SetBarHeightCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	if(!cParts[1] || !cParts[1].match(/^\d+$/)){
        callback([1, "Syntax: \\sbh {HEIGHT}", "message"]);
        return;
	}

	screen.settings.barHeight = parseInt(cParts[1])

	if(screen.settings.barHeight < 0){
		screen.settings.barHeight = 0;
	}

	screen.settings.save();

	callback([0, "Bar height set to: " + screen.settings.barHeight, "message"]);
}

module.exports = SetBarHeightCommandHandler;