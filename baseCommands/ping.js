
var PingCommandHandler = function(){
	this.description = "Ping the HANA instance by making a new connection";
}

PingCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var startTime = new Date().getTime();

	conn.cloneConnection("conn", "ping-conn", function(){

		var diff = new Date().getTime() - startTime;

		callback([0, "Ping Time (ms): " + diff, "message"]);

	});

}

module.exports = PingCommandHandler;