var SavedConnectionManager = require("../SavedConnectionManager.js");

var PasswordCommandHandler = function() {
	this.description = "";
}

PasswordCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {
	this.conn = conn;
	this.screen = screen;
	this.finalCallback = callback;

	this.args = require('optimist')(cParts).argv._;

	this.user = (this.args.length > 1 ? this.args[1] : conn.getClientConfig("conn").user);

	this.inputBuffer = "";

	this.printHeader();
	this.bindInput();

	// async.waterfall([
	// 	this.setPassword.bind(this),
	// 	this.outputResult.bind(this)
	// ], function(err, data) {
	// 	this.finalCallback([err == null ? 0 : 1, err == null ? "Password set." : err, err == null ? "message" : "sql-error"]);
	// })

}

PasswordCommandHandler.prototype.printHeader = function(){
	this.screen.print("Setting password for user '" + this.user + "'\n");
	this.screen.print("Password: ")
}

PasswordCommandHandler.prototype.bindInput = function() {
	
	/**
	 * Re-enable input
	 */
	process.stdin.resume();

	/**
	 * Capture key pressses
	 */
	process.stdin._events.keypress = function(ch, key) {
		/**
		 * Catch exit command
		 */
		if (key && key.ctrl && key.name == 'c') {
			this.exit();
			return;
		}

		var char = key.sequence;

		/**
		 * Handle backspace input
		 */
		if(key.name == "backspace"){
			char = "";
			this.inputBuffer = this.inputBuffer.substring(0, this.inputBuffer.length - 1);
		}

		if(key.name == "return"){
			this.setPassword(this.inputBuffer);
		}else{
			this.inputBuffer += char;
		}

	}.bind(this);
}

PasswordCommandHandler.prototype.setPassword = function(password) {
	this.conn.exec("conn", "ALTER USER " + this.user + ' PASSWORD "' + this.inputBuffer + '"', function(err, data) {

		/*
		 * Save new password to file
		 */
		if(!err){

			var connDetails = this.conn.getClientConfig("conn");

			/*
			 * Save new password to config
			 */
			var connManager = new SavedConnectionManager();
			connManager.updateAllForInstanceUser(connDetails.host, connDetails.user, connDetails.port, this.inputBuffer);
		}

	    this.outputResult(err, data);
	}.bind(this))
}

PasswordCommandHandler.prototype.outputResult = function(err, data) {
	
	if(err){
		var output = require("../dataFormatters/sql-error.js")("", err);

		this.screen.print("\n");
		this.screen.print(output.join("\n"));

	}else{
		this.screen.print("\n");
		this.screen.print("Success!".green.bold);
	}

	this.exit();
}

PasswordCommandHandler.prototype.exit = function(){
	this.finalCallback([0, "", "message"]);
	return;
}

module.exports = PasswordCommandHandler;