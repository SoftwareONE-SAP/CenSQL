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

    	handlers[key].run(key, [key], conn, screen, function(output){
    		
    		output.unshift(key)

    		screen.renderCommandOutput(key, [output], function(err, data){
    			if(err){
    				callback(err, null);
    				return;
    			}

    			if(data.length == 0){
    				data = ["Nothing returned"]
    			}

    			callback(null, [key, data[0]])
    		})

    	})

    }, function(err, data){	
		if(err){
			callback([1, err, "sql-error"]);
			return;
		}

		var output = "";

		for (var i = 0; i < data.length; i++) {

			if(!data[i]){
				continue;
			}

			output += ("\\" + data[i][0]).cyan + "\n";
			output += data[i][1].join("\n") + "\n\n";
		}

		callback([0, output, "message"]);
    });

}

module.exports = AuditCommandHandler;