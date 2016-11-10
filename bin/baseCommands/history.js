
var HistoryCommandHandler = function(){
	this.includeInAudit = false
}

HistoryCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var amount = parseInt(cParts[1] && !isNaN(cParts[1]) ? cParts[1] : 10);

	var commands = screen.rl.history.slice(0, amount + 1);

	var data = [];

	for (var i = commands.length - 1; i >= 0; i--) {
		data.push({COMMAND: commands[i]})
	}

	callback([0, data, "default"]);
}

module.exports = HistoryCommandHandler;