var SavedConnectionManager = require("../SavedConnectionManager.js");

var SaveConnectionCommandHandler = function(){
	this.description = "";

	this.connManager = new SavedConnectionManager();
}

SaveConnectionCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	if(!cParts[1]){
        callback([1, "Syntax: \\save {ALIAS}", "message"]);
        return;
	}

	var name = "" + cParts[1];

	/**
	 * Get connection information
	 * @type {Object}
	 */
	var connectionSettings = {
		host: conn.connections.conn._settings.host,
		user: conn.connections.conn._settings.user,
		pass: conn.connections.conn._settings.password,
		port: conn.connections.conn._settings.port
	}

	/**
	 * Save to file
	 */
	this.connManager.add(connectionSettings, name);

    /**
     * All done
     */
	callback([0, "Connection saved as " + name, "message"]);
}

module.exports = SaveConnectionCommandHandler;