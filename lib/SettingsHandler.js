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
        delete self.force_nocolour;

        /**
         * Use locking to avoid file corruption issues
         */
        try {
            lockFile.lockSync(settingsFilePath + ".lock", {
                stale: 500,
                retries: 10
            });
        } catch (e) {
            console.log(e);
            console.log("Failed to get lock whilst saving settings! Lock file located at: " + settingsFilePath + ".lock");
            process.exit(1)
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

        /**
         * Remove lock file
         */
        try {
            lockFile.unlockSync(settingsFilePath + ".lock")
        } catch (e) {
            console.log(e);
            console.log("Failed to remove lock whilst saving settings! Lock file located at: " + settingsFilePath + ".lock");
            process.exit(1)
        }

    }

    /**
     * load settings from file
     */
    settings.load = function() {

        /**
         * Use locking to avoid file corruption issues
         */
        try {
            lockFile.lockSync(settingsFilePath + ".lock", {
                stale: 500,
                retries: 10
            });
        } catch (e) {
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
                settings[keys[i]] = data[keys[i]];
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
        try {
            lockFile.unlockSync(settingsFilePath + ".lock")
        } catch (e) {
            console.log("Failed to remove lock whilst saving settings! Lock file located at: " + settingsFilePath + ".lock");
        }

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