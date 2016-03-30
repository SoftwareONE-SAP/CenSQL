var charm = require('charm')(process.stdout);
var colors = require("colors");

var StudioSession = function(screen){
	this.screen = screen;

	this.init();	
}

StudioSession.prototype.init = function(){
	process.stdin._events.keypress = function(ch, key) {
        if (key && key.ctrl && key.name == 'c') {
            console.log("")
            process.exit(0)
        }
    };

    this.screen.print(colors.green("Woo studio! > "));
}

module.exports = StudioSession;