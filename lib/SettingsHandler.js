var path = require("path");
var fs = require("fs");
var osHomedir = require('os-homedir');
var lockFile = require('lockfile');

var SettingsHandler = function() {}

SettingsHandler.prototype.getSettings = function(callback) {
    /**
     * Load settings
     */
    var settings = {};

    var settingsFilePath = path.join(osHomedir(), ".censql", "censql_settings");

    /**
     * Save settings to file
     */
    settings.save = function(callback) {
        var self = JSON.parse(JSON.stringify(this));

        delete self.save;
        delete self.load;
        delete self.studio;
        delete self.force_nocolour;

        /**
         * Use locking to avoid file corruption issues
         */
        lockFile.lock(settingsFilePath + ".lock", {
            stale: 500,
            retries: 10
        }, function(err) {
            if (err) {
                callback(e, null);
                return;
            }

            /**
             * Actually save the settings
             */

            var folderLocation = path.dirname(settingsFilePath);

            if (!fs.existsSync(folderLocation)) {
                fs.mkdirSync(folderLocation);
            }

            fs.writeFileSync(settingsFilePath, JSON.stringify(self, null, 4));

            /**
             * Remove lock file
             */
            lockFile.unlock(settingsFilePath + ".lock", function(err) {
                callback(err, null);
            }.bind(this))

        }.bind(this));

    }

    /**
     * load settings from file
     */
    settings.load = function(callback) {

        /**
         * Use locking to avoid file corruption issues
         */
        lockFile.lock(settingsFilePath + ".lock", {
            stale: 500,
            retries: 10
        }, function(err) {
            if (err) {
                callback(e, null);
                return;
            }

            var data = JSON.parse(fs.readFileSync(settingsFilePath).toString());

            var keys = Object.keys(data);

            for (var i = keys.length - 1; i >= 0; i--) {
                settings[keys[i]] = data[keys[i]];
            };

            /**
             * Remove lock file
             */
            lockFile.unlock(settingsFilePath + ".lock", function(err) {
                callback(err, null);
            }.bind(this))

        }.bind(this));

    }

    /**
     * Load
     */
    settings.load(function() {
        settings = this.setDefaults(settings);

        /**
         * Save the defaults
         */
        settings.save(function(err){
            if(err){
                callback(err, null);
            }else{
                callback(null, settings);
            }
        });
    }.bind(this));
}

SettingsHandler.prototype.setDefaults = function(settings) {

    /**
     * Set defaults
     */
    if (!settings.plotHeight) settings.plotHeight = 11;
    if (!settings.barHeight) settings.barHeight = 1;
    if (!("relativeGraphs" in settings)) settings.relativeGraphs = false;

    if (!("csv" in settings)) {
        settings.csv = {};
    }

    if (!("delimeter" in settings.csv)) {
        settings.csv.delimeter = ",";
    }

    if (!settings.promptDetail) settings.promptDetail = "full";

    if (!("colour" in settings)) {
        settings.colour = true;
    }

    return settings;
}

module.exports = SettingsHandler;