#!/usr/bin/env node

var ScreenManager = require("./util/ScreenManager.js");
var CommandHandler = require("./util/CommandHandler.js");
var HDB = require("./lib/HdbHandler.js");
var argv = require('optimist').argv;
var mkdirp = require('mkdirp');
var path = require('path');
var async = require("async");
var osHomedir = require('os-homedir');
var fs = require("fs");
var pad = require("pad");
var SavedConnectionManager = require("./util/SavedConnectionManager.js");
var CliTable = require('cli-table');

var CenSql = function() {

    /**
    * Bodge to fix hdb module
    * @type {Boolean}
    */
    process.browser = true;

    /**
    * get a global object for storing flags in
    */
    GLOBAL.censql = {};

    /**
    * Dont accept user input until we're ready
    * @type {Boolean}
    */
    GLOBAL.censql.RUNNING_PROCESS = true;

    async.series([

        this.createFolderIfNeeded.bind(this),
        this.showHelpTextIfNeeded.bind(this),
        function(callback) {
            this.createScreen(this.getSettings(), callback);
        }.bind(this)

    ], function() {

        this.connManager = new SavedConnectionManager();

        if (argv.l || argv.list_connections) {
            this.listConfiguredConnectionNames();
            return;
        }

        var connDetails = argv;

        if (argv.use) {
            connDetails = this.connManager.get(argv.use);
        }

        if (connDetails) {
            this.screen.init();

            this.connectToHdb(connDetails.host, connDetails.user, connDetails.pass, connDetails.port);
        } else {
            this.screen.print("Connection '".red + argv.use.red.bold + ("' does not exist. Use the \\save command whilst connected to save a connection.").red, function() {
                console.log();
                process.exit(1)
            })
        }

    }.bind(this))

}

CenSql.prototype.listConfiguredConnectionNames = function() {
    var contents = this.connManager.getAll();
    var names = Object.keys(contents);

    var table = new CliTable();

    for (var i = 0; i < names.length; i++) {
        table.push([names[i].bold, contents[names[i]].user, contents[names[i]].host, contents[names[i]].port])
    }

    console.log(table.toString());
}

CenSql.prototype.setTitle = function() {

    var title = "censql";

    process.stdout.write(String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7));
    process.title = title;
}

CenSql.prototype.getSettings = function() {
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

        fs.writeFileSync(settingsFilePath, JSON.stringify(self));
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
    if (!"relativeGraphs" in settings) settings.relativeGraphs = false;

    /**
    * Save the defaults
    */
    settings.save();

    return settings;
}

CenSql.prototype.connectToHdb = function(host, user, pass, port) {

    this.hdb = new HDB();

    /**
    * Connect to HANA with the login info supplied by the user
    */
    this.hdb.connect(host, user, pass, port, "conn", function(err, data) {

        if (err) {
            this.screen.error(err.message);
            process.exit(1);
        }

        /**
        * If the user specified the command, we do not want to open an interactive session
        */
        if (!argv.command) {
            this.screen.ready.call(this.screen, this.hdb);
        }

        /**
        * Create a new command handler
        */
        this.commandHandler = new CommandHandler(this.screen, this.hdb, argv.command);

        /**
        * Allow user inpput from now on
        * @type {Boolean}
        */
        GLOBAL.censql.RUNNING_PROCESS = false;

    }.bind(this))
}

CenSql.prototype.createScreen = function(settings, callback) {

    /**
    * keep the colour var in settings just to make it easy to use, but we wont actually save it
    * @type {[type]}
    */
    settings.colour = argv['no-colour'] || argv['no-color'] ? false : true;
    settings.studio = !!argv['studio'] || !!argv['s'];

    /**
    * Create screen object adn give it the command handler to handle user input
    */
    this.screen = new ScreenManager(
        // Command if given
        !!argv.command,
        settings,

        // Command Handler
        {
            handleCommand: function(command, callback) {
                this.commandHandler.onCommand(command, callback);
            }.bind(this)
        }
    )

    if(!argv.command){
        this.setTitle();
    }

    callback.call(this, null);
}

CenSql.prototype.showHelpTextIfNeeded = function(callback) {
    /**
    * Make sure we have the arguments needed to connect to HANA
    */
    if (((!argv.host || !argv.user || !argv.pass || !argv.port) && !argv.use && !(argv.l || argv.list_connections)) || argv.help) {
        console.log([
            "Usage:\t censql --user <USER> --port 3<ID>15 --host <IP OR HOSTNAME> --pass <PASSWORD>",
            "\t censql --user <USER> --port 3<ID>15 --host <IP OR HOSTNAME> --pass <PASSWORD> --command '<SQL_STRING>'",
            "\t censql --use <ALIAS>",
            "Example: censql --user SYSTEM --port 30015 --host 192.168.0.1 --pass Password123",
            "Example: censql --user SYSTEM --port 30015 --host 192.168.0.1 --pass Password123 --command 'SELECT * FROM SYS.M_SERVICES'",
            "Example: censql --use prd",
            "",
            "CenSQL Help",
            "--user\t\tThe username for the user to connect as",
            "--pass\t\tThe password for the user connecting with",
            "--host\t\tThe host to connect to",
            "--port\t\tThe port to connect to the host with (Layout: '3<ID>15', Instance 99 would be 39915)",
            "--use <ALIAS>\tConnect using a saved connection instead of user,pass,host,port",
            "",
            "--command\t\tOptionally run a command/sql without entering the interective terminal",
            "-s --studio\t\tEnter studio mode",
            "",
            "-l --list_connections\tOptionally run a command/sql without entering the interective terminal",
            "--preview_size <COUNT>\tchange amount of rows shown in table preview in studio mode",
            "",
            "--no-colour\tdisable colour output",
            "--no-color\talias of --no-colour",
        ].join("\n"));

        process.exit(0);
    }

    callback.call(this, null);
}

CenSql.prototype.createFolderIfNeeded = function(callback) {
    var location = path.join(osHomedir(), ".censql");
    mkdirp.sync(location, 0777);

    callback(null);
};

new CenSql();
