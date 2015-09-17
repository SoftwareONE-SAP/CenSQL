var async = require("async")

var PingCommandHandler = function(){
	this.description = "Ping the HANA instance by making a new connection";
}

PingCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){
	this.conn = conn;

	var isForever = cParts[1] == "-f" || cParts[1] == "--forever";
	var delay = (cParts[2] && parseFloat(cParts[2]) > 0 ? parseFloat(cParts[2]) * 1000 : 500);

	/**
	 * Is the command being ran in in constant ping mode
	 */
	if(isForever){

		/**
		 * Allow the user to ^C out
		 */
		process.stdin.resume();

		/**
		 * Whilst the user does not want to quit, ping constantly
		 */
		async.whilst(function(){return !GLOBAL.SHOULD_EXIT}, function(next){

			this.ping(function(diff){

				console.log("Ping Time (ms): " + diff)

				setTimeout(function(){
					next();
				}, delay);

			});

		}.bind(this), function(err){
			callback([0, null, null]);
		})

	/**
	 * Run the command once
	 */
	}else{

		this.ping(function(diff){

			callback([0, "Ping Time (ms): " + diff, "message"]);

		});

	}

}

PingCommandHandler.prototype.ping = function(callback){
	var startTime = new Date().getTime();

	this.conn.cloneConnection("conn", "ping-conn", function(){

		this.conn.close("ping-conn");

		var diff = new Date().getTime() - startTime;

		callback(diff);

	}.bind(this));
}

module.exports = PingCommandHandler;