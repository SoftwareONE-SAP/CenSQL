var path = require("path");
var fs = require("fs");
var osHomedir = require('os-homedir');
var lockFile = require('lockfile');

var SettingsHandler = function() {}

SettingsHandler.prototype.getSettings = function() {
    /**
     * Load settings
     */
    var settings = {};

    var settingsFilePath = path.join(osHomedir(), ".censql", "censql_settings");

    /**
     * Save settings to file
     */
    settings.save = function() {
        var self = JSON.parse(JSON.stringify(this));

        delete self.save;
        delete self.load;
        delete self.studio;

        /**
         * Use locking to avoid file corruption issues
         */
        lockFile.lock(settingsFilePath + ".lock", {
            stale: 500,
            retries: 10,
            retryWait: 100 + (Math.random() * 100) // Random wait time incase multiple instances of censql keep battling for the settings file
        }, function(err) {
            if (err) {
                console.log("Failed to get lock whilst saving settings! Lock file located at: " + settingsFilePath + ".lock");
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
                if (err) {
                    console.log("Failed to remove lock whilst saving settings! Lock file located at: " + settingsFilePath + ".lock");
                    return;
                }
            });

        });

    }

    /**
     * load settings from file
     */
    settings.load = function() {

        /**
         * Use locking to avoid file corruption issues
         */
        lockFile.lock(settingsFilePath + ".lock", {
            stale: 500,
            retries: 10,
            retryWait: 100 + (Math.random() * 100) // Random wait time incase multiple instances of censql keep battling for the settings file
        }, function(err) {
            if (err) {
                console.log("Failed to get lock whilst saving settings! Lock file located at: " + settingsFilePath + ".lock");
                return;
            }

            /**
             * Load settings data
             */

            try {
                var data = JSON.parse(fs.readFileSync(settingsFilePath).toString());

                var keys = Object.keys(data);

                for (var i = keys.length - 1; i >= 0; i--) {
                    this[keys[i]] = data[keys[i]];
                };

            } catch (e) {
                /**
                 * Since we had an error, this is likely to do with the file not existing. Lets save a default file and then load that
                 */
                this.save();
                this.load();
            }

            /**
             * Remove lock file
             */

            lockFile.unlock(settingsFilePath + ".lock", function(err) {
                if (err) {
                    console.log("Failed to remove lock whilst saving settings! Lock file located at: " + settingsFilePath + ".lock");
                    return;
                }
            });

        });

    }

    settings.load();

    settings = this.setDefaults(settings);

    /**
     * Save the defaults
     */
    settings.save();

    return settings;
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