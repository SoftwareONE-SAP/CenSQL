var crypto = require('crypto');
var path = require('path');
var osHomedir = require('os-homedir');
var fs = require("fs");

/**
 * Init saved connections
 */
var SavedConnectionManager = function() {
    this.configPath = path.join(osHomedir(), ".censql", "saved_connections");
    this.load();
}

/**
 * Save connections to file
 */
SavedConnectionManager.prototype.save = function() {
    /**
     * Write config to file
     */
    fs.writeFileSync(this.configPath, new Buffer(JSON.stringify(this.contents, null, 4)).toString("base64"));
    fs.chmodSync(this.configPath, "600");
}

/**
 * Reload connections from file
 */
SavedConnectionManager.prototype.load = function() {
    try {
        this.contents = JSON.parse(new Buffer(fs.readFileSync(this.configPath).toString(), 'base64'));
    } catch (e) {
        this.contents = {};
    }
}

/**
 * Encrypt password. NOTE: This is in no way a secure method of keeping passwords safe, it is here just add security via obscurity.
 */
SavedConnectionManager.prototype.encryptPassword = function(connectionSettings) {
    /**
     * Encrypt password. (This is mainly to stop accidenatlly finding a password, rather than keeping passwords from attackers)
     */
    var cipher = crypto.createCipher("aes256", new Buffer(connectionSettings.host + connectionSettings.user + connectionSettings.port).toString('base64'));

    connectionSettings.pass = cipher.update(connectionSettings.pass, 'utf8', 'hex') + cipher.final('hex');

    return connectionSettings;
}

/**
 * Add a new connection and save it
 */
SavedConnectionManager.prototype.add = function(connectionSettings, name) {

    connectionSettings = this.encryptPassword(connectionSettings);

    this.load();

    /**
     * Add to config
     */
    this.contents[name] = connectionSettings;

    this.save();
}

/**
 * Remove a saved connection
 */
SavedConnectionManager.prototype.delete = function(name) {
    this.load();

    /**
     * Delete from config
     */
    delete this.contents[name];

    this.save();
}

/**
 * Get the decrypted connection by its name
 */
SavedConnectionManager.prototype.get = function(name) {
    /**
     * Could not load details for name
     */
    if (Object.keys(this.contents).indexOf(name) === -1) {
        return null;
    }

    /**
     * Found it!
     */
    var connDetails = this.contents[name];

    /**
     * Decrypt the password
     */
    var decipher = crypto.createDecipher('aes256', new Buffer(connDetails.host + connDetails.user + connDetails.port).toString('base64'));

    connDetails.pass = decipher.update(connDetails.pass, 'hex', 'utf8') + decipher.final('utf8');

    return connDetails;
}

/**
 * Get all connections (used to test/list all connections with the censql -l and -t commands)
 */
SavedConnectionManager.prototype.getAll = function() {
    this.load();

    var output = {};
    var keys = Object.keys(this.contents);

    for (var i = keys.length - 1; i >= 0; i--) {
        var entry = this.contents[keys[i]];

        var decipher = crypto.createDecipher('aes256', new Buffer(entry.host + entry.user + entry.port).toString('base64'));

        entry.pass = decipher.update(entry.pass, 'hex', 'utf8') + decipher.final('utf8');

        output[keys[i]] = entry;
    }

    return output;
}

SavedConnectionManager.prototype.updateAllForInstanceUser = function(host, user, port, newPass) {
    this.load();

    var keys = Object.keys(this.contents);

    for (var i = keys.length - 1; i >= 0; i--) {
        if (this.contents[keys[i]].host == host && this.contents[keys[i]].user == this.contents[keys[i]].user && this.contents[keys[i]].port == this.contents[keys[i]].port) {

            var entry = this.contents[keys[i]];

            entry.pass = newPass;

            this.contents[keys[i]] = this.encryptPassword(entry);
        }
    }

    this.save();

}

module.exports = SavedConnectionManager;