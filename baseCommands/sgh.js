
var SetGraphHeightCommandHandler = function(){
	this.description = "";
	this.helpText = "";
}

SetGraphHeightCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	if(!cParts[1] || !cParts[1].match(/^\d+$/)){
          callback([1, "Syntax: \\sgh {HEIGHT}", "message"]);
          return;
      }

      screen.settings.plotHeight = parseInt(cParts[1])

      callback([0, "Graph height set to: " + screen.settings.plotHeight, "message"]);
}

module.exports = SetGraphHeightCommandHandler;