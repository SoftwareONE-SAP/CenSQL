var hdb = require('hdb');
var async = require("async");

var HdbHandler = function(callback) {
    this.connections = {};
}

HdbHandler.prototype.connect = function(hostname, username, password, port, tenant, sessionID, callback) {

    // Create client
    var client = hdb.createClient({
        host: hostname,
        user: username,
        password: password,
        port: port,
        databaseName: tenant
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
    this.connect(config.host, config.user, config.password, config.port, config.databaseName, newSessionID, callback);
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
HdbHandler.prototype.exec = function(sessionID, sql, params, callback) {
    if(!callback){
        callback = params;
        params = [];
    }

    if (!this.connections[sessionID]) {
        callback("Not Connected to HANA", null);
        return;
    }

    this.connections[sessionID].prepare(sql, (err, statement) => {
        if (err) {
            callback(err);
            return;
        }
        
        statement.exec(params, callback);

    });

}

module.exports = HdbHandler;
