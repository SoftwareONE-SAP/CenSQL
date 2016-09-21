#!/usr/bin/env node

var ScreenManager = require("./bin/ScreenManager.js");
var CommandHandler = require("./bin/CommandHandler.js");
var HDB = require("./lib/HdbHandler.js");
var argv = require('optimist').argv;
var mkdirp = require('mkdirp');
var path = require('path');
var async = require("async");
var osHomedir = require('os-homedir');
var fs = require("fs");
var SavedConnectionManager = require("./bin/SavedConnectionManager.js");
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
    global.censql = {};

    /**
     * Dont accept user input until we're ready
     * @type {Boolean}
     */
    global.censql.RUNNING_PROCESS = true;

    /**
     * Get settings
     * @type {Object}
     */
    this.settings = this.getSettings();

    async.series([

        this.createFolderIfNeeded.bind(this),
        this.showHelpTextIfNeeded.bind(this),
        function(callback) {
            this.createScreen(this.settings, callback);
        }.bind(this)

    ], function() {

        this.connManager = new SavedConnectionManager();

        /**
         * Should version
         */
        if (argv.version) {
            this.showVersion();
            return;
        }

        /**
         * Should list connections
         */
        if (argv.l || argv.list_connections) {
            this.listConfiguredConnectionNames();
            return;
        }

        /**
         * Should check all connections
         */
        if (argv.t || argv.connection_test) {
            this.testSavedConnections();
            return;
        }

        /**
         * Should forget a connection
         */
        if (argv.forget) {
            this.connManager.delete(argv.forget);
            console.log(("Forgot " + argv.forget + "!").green);
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
            if (argv.use.length > 0) {
                this.screen.print("Connection '".red + argv.use.red.bold + ("' does not exist. Use the \\save command whilst connected to save a connection.").red, function() {
                    console.log();
                    process.exit(1)
                })
            } else {
                this.showHelp();
            }
        }

    }.bind(this))
}

CenSql.prototype.testSavedConnections = function() {
    var contents = this.connManager.getAll();
    var keys = Object.keys(contents);

    async.mapLimit(keys, 50, function(key, callback) {

        var entry = contents[key];

        var db = new HDB();

        /**
         * Connect to HANA with the login info supplied by the user
         */
        db.connect(entry["host"], entry["user"], entry["pass"], entry["port"], "tmp_" + key, function(err, data) {

            if (err) {
                callback(null, {
                    status: 1,
                    key: key,
                    message: "Error connecting: " + err
                });
                return;
            }

            db.close();

            callback(null, {
                status: 0,
                key: key,
                message: "Connected Successfully"
            });

        }.bind(this))

    }, function(err, output) {
        if (err) {
            console.log(err);
            return;
        }

        output = output.sort(function(a, b) {
            return a.key.localeCompare(b.key);
        })

        var table = new CliTable({
            chars: (new (require("./lib/CharacterCodeIndex.js"))).tableChars
        });


        table.push(["Name".bold, "Status".bold, "Details".bold])

        for (var i = 0; i < output.length; i++) {
            table.push([output[i].key.bold, (output[i].status == 0 ? "OK".green.bold : "ERROR".red.bold), output[i].message])
        }

        console.log(table.toString());

        process.exit(0);
    })
}

CenSql.prototype.showVersion = function() {
    var package = require("./package.json");

    console.log(package.version)

    process.exit(0);
}

CenSql.prototype.listConfiguredConnectionNames = function() {
    var contents = this.connManager.getAll();
    var names = Object.keys(contents);

    var table = new CliTable({
        chars: (new (require("./lib/CharacterCodeIndex.js"))).tableChars
    });

    for (var i = 0; i < names.length; i++) {
        table.push([names[i].bold, contents[names[i]].user, contents[names[i]].host, contents[names[i]].port])
    }

    console.log(table.toString());
}

CenSql.prototype.setTitle = function(isStudio) {

    var title = "CenSQL" + (isStudio ? " Studio" : "");

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
            this.screen.error(err.message + "\n", function() {
                process.exit(1);
            });

            return;
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
        this.commandHandler = new CommandHandler(this.screen, this.hdb, argv.command, this.settings);

        /**
         * Allow user inpput from now on
         * @type {Boolean}
         */
        global.censql.RUNNING_PROCESS = false;

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

    if (!argv.command) {
        this.setTitle(settings.studio);
    }

    callback.call(this, null);
}

CenSql.prototype.showHelpTextIfNeeded = function(callback) {
    /**
     * Make sure we have the arguments needed to connect to HANA
     */
    if (((!argv.host || !argv.user || !argv.pass || !argv.port) && (!argv.use || argv.use.length == 0) && !(argv.l || argv.list_connections) && !(argv.t || argv.connection_test) && !argv.forget && !argv.version) || argv.help) {
        this.showHelp();
    }

    callback.call(this, null);
}

CenSql.prototype.showHelp = function() {
    console.log([
        "Usage:\t censql --user <USER> --port 3<ID>15 --host <IP OR HOSTNAME> --pass <PASSWORD>",
        "\t censql --user <USER> --port 3<ID>15 --host <IP OR HOSTNAME> --pass <PASSWORD> --command '<SQL_STRING>'",
        "\t censql --use <ALIAS>",
        "Example: censql --user SYSTEM --port 30015 --host 192.168.0.1 --pass Password123",
        "Example: censql --user SYSTEM --port 30015 --host 192.168.0.1 --pass Password123 --command 'SELECT * FROM SYS.M_SERVICES'",
        "Example: censql --use DEV1",
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
        "-l --list_connections\tList saved connections",
        "-t --connection_test\tConnect to every saved connection and check HANA's status",
        "--forget <NAME>\t\tForget a saved connection",
        "",
        "--no-colour\t\tDisable colour output",
        "--no-color\t\tAlias of --no-colour",
        "",
        "--version\tShow CenSQL version",
    ].join("\n"));

    process.exit(0);
}

CenSql.prototype.createFolderIfNeeded = function(callback) {
    var location = path.join(osHomedir(), ".censql");
    mkdirp.sync(location, 0777);

    callback(null);
};

new CenSql();