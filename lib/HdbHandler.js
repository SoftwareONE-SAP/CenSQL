var hdb = require('hdb');
var async = require("async");

var HdbHandler = function(callback) {
    this.connections = {};
}

HdbHandler.prototype.connect = function(hostname, username, password, port, sessionID, callback) {

    // Create client
    var client = hdb.createClient({
        host: hostname,
        user: username,
        password: password,
        port: port
    });

    // Connect to Database
    client.connect(function(err) {

        // If there is an error, complain
        if (err) {
            callback(err, null);
            return;
        }

        this.connections[sessionID] = client;

        callback(null, null);

    }.bind(this));

}

HdbHandler.prototype.close = function(sessionID) {
    if (this.connections[sessionID]) {
        return this.connections[sessionID].end();
    }
}

HdbHandler.prototype.cloneConnection = function(sessionID, newSessionID, callback) {
    var config = this.getClientConfig(sessionID);
    this.connect(config.host, config.user, config.password, config.port, newSessionID, callback);
}

HdbHandler.prototype.getClientConfig = function(sessionID) {
    if (this.connections[sessionID]) {
        return this.connections[sessionID]._settings;
    }

    return null
}

/**
 * Run a query specified by the user
 * @param  {String}   sessionID the user's session ID, for getting their client
 * @param  {String}   query     the query to run on the HANA instance
 * @param  {Function} callback  Called when the query is finished
 * @return {void}
 */
HdbHandler.prototype.exec = function(sessionID, sql, callback) {
    if (!this.connections[sessionID]) {
        callback("Not Connected to HANA", null);
        return;
    }

    /**
     * Run all queries
     */
    this.connections[sessionID].exec(sql, function(err, data) {
        if (err) {
            callback(err, data);
            return;
        }

        callback(null, data);
    })

}

module.exports = HdbHandler;