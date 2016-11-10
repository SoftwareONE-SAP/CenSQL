var async = require("async");

var AuditCommandHandler = function(){
	this.includeInAudit = false;
}

AuditCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var handlers = screen.commandHandler.getHandlers();

	var keys = Object.keys(handlers);

	keys = keys.sort(function(a, b) {
        if (a.toLowerCase() > b.toLowerCase()) return 1;
        if (b.toLowerCase() > a.toLowerCase()) return -1;
        return 0;
    })

	var toRun = [];

    for (var i = 0; i < keys.length; i++) {

    	if(!handlers[keys[i]].includeInAudit) continue;

    	toRun.push(keys[i]);
    }

    async.map(toRun, function(key, callback){

    	handlers[key].run(command, cParts, conn, screen, function(output){
    		
    		output.unshift(key)

    		// screen.renderCommandOutput(command, [output], callback)
    		
    		callback(null, null);

    	})

    }, function(err, data){	
		if(err){
			callback([1, err, "sql-error"]);
			return;
		}

		var output = "";

		for (var i = 0; i < data.length; i++) {
			for (var k = 0; k < data[i].length; k++) {
				output += data[i][k] + "\n";
			}
		}

		// console.log(output);

		callback([0, "output", "message"]);
    });

}

module.exports = AuditCommandHandler;