var path = require("path");
var fs = require("fs");
var osHomedir = require('os-homedir');

var SettingsHandler = function(){}

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
        delete self.colour;
        delete self.studio;

        var folderLocation = path.dirname(settingsFilePath);

        if (!fs.existsSync(folderLocation)) {
            fs.mkdirSync(folderLocation);
        }

        fs.writeFileSync(settingsFilePath, JSON.stringify(self, null, 4));
    }

    /**
     * load settings from file
     */
    settings.load = function() {

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

    }

    settings.load();

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

    /**
     * Save the defaults
     */
    settings.save();

    return settings;
}

module.exports = SettingsHandler;