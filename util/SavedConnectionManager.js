var crypto = require('crypto');
var path = require('path');
var osHomedir = require('os-homedir');
var fs = require("fs");

var SavedConnectionManager = function(){
	this.configPath = path.join(osHomedir(), ".censql", "saved_connections");
	this.load();
}

SavedConnectionManager.prototype.save = function(){
	/**
     * Write config to file
     */
    fs.writeFileSync(this.configPath, new Buffer(JSON.stringify(this.contents)).toString("base64"));
}

SavedConnectionManager.prototype.load = function(){
	 try{
        this.contents = JSON.parse(new Buffer(fs.readFileSync(this.configPath).toString(), 'base64'));
    }catch(e){
        this.contents = {};
    }
}

SavedConnectionManager.prototype.encryptPassword = function(connectionSettings){
	/**
	 * Encrypt password. (This is mainly to stop accidenatlly finding a password, rather than keeping passwords from attackers)
	 */
	var cipher = crypto.createCipher("aes256", new Buffer(connectionSettings.host + connectionSettings.user + connectionSettings.port).toString('base64')); 

	connectionSettings.pass = cipher.update(connectionSettings.pass, 'utf8', 'hex') + cipher.final('hex');

	return connectionSettings;
}

SavedConnectionManager.prototype.add = function(connectionSettings, name){

	connectionSettings = this.encryptPassword(connectionSettings);

	this.load();

	/**
     * Add to config
     */
    this.contents[name] = connectionSettings;

    this.save();
}

SavedConnectionManager.prototype.get = function(name){
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

    connDetails.pass = decipher.update(connDetails.pass, 'hex', 'utf8') + decipher.final('utf8');;

    return connDetails;
}

SavedConnectionManager.prototype.getAll = function(){
	this.load();

	return this.contents
}

module.exports = SavedConnectionManager;