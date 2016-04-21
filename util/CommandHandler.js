var async = require("async");
var path = require("path");

var CommandHandler = function(screen, hdb, command) {
    this.screen = screen;
    this.hdb = hdb;

    this.loadCommandHandlers();

    if (command) {
        this.onCommand(command, function(err, output) {
            this.screen.printCommandOutput(command, output, function(){
                process.exit(0)
            });
        }.bind(this));
    }

}

/**
 * Require the baseCommands from the baseCommands folder and save them by their file name
 */
CommandHandler.prototype.loadCommandHandlers = function() {

    this.handlers = {};

    this.handlers["al"] = new (require("./baseCommands/al.js"))(this);
    this.handlers["ba"] = new (require("./baseCommands/ba.js"))(this);
    this.handlers["con"] = new (require("./baseCommands/con.js"))(this);
    this.handlers["cpu"] = new (require("./baseCommands/cpu.js"))(this);
    this.handlers["csc"] = new (require("./baseCommands/csc.js"))(this);
    this.handlers["csd"] = new (require("./baseCommands/csd.js"))(this);
    this.handlers["csm"] = new (require("./baseCommands/csm.js"))(this);
    this.handlers["csr"] = new (require("./baseCommands/csr.js"))(this);
    this.handlers["csw"] = new (require("./baseCommands/csw.js"))(this);
    this.handlers["disk"] = new (require("./baseCommands/disk.js"))(this);
    this.handlers["ds"] = new (require("./baseCommands/ds.js"))(this);
    this.handlers["dt"] = new (require("./baseCommands/dt.js"))(this);
    this.handlers["du"] = new (require("./baseCommands/du.js"))(this);
    this.handlers["dv"] = new (require("./baseCommands/dv.js"))(this);
    this.handlers["help"] = new (require("./baseCommands/help.js"))(this);
    this.handlers["h"] = new (require("./baseCommands/h.js"))(this);
    this.handlers["hmem"] = new (require("./baseCommands/hmem.js"))(this);
    this.handlers["imem"] = new (require("./baseCommands/imem.js"))(this);
    this.handlers["in"] = new (require("./baseCommands/in.js"))(this);
    this.handlers["ips"] = new (require("./baseCommands/ips.js"))(this);
    this.handlers["li"] = new (require("./baseCommands/li.js"))(this);
    this.handlers["logs"] = new (require("./baseCommands/logs.js"))(this);
    this.handlers["mem"] = new (require("./baseCommands/mem.js"))(this);
    this.handlers["ping"] = new (require("./baseCommands/ping.js"))(this);
    this.handlers["pwl"] = new (require("./baseCommands/pwl.js"))(this);
    this.handlers["rep"] = new (require("./baseCommands/rep.js"))(this);
    this.handlers["row"] = new (require("./baseCommands/row.js"))(this);
    this.handlers["sbh"] = new (require("./baseCommands/sbh.js"))(this);
    this.handlers["sc"] = new (require("./baseCommands/sc.js"))(this);
    this.handlers["scpu"] = new (require("./baseCommands/scpu.js"))(this);
    this.handlers["serv"] = new (require("./baseCommands/serv.js"))(this);
    this.handlers["sgh"] = new (require("./baseCommands/sgh.js"))(this);
    this.handlers["smem"] = new (require("./baseCommands/smem.js"))(this);
    this.handlers["st"] = new (require("./baseCommands/st.js"))(this);
    this.handlers["stor"] = new (require("./baseCommands/stor.js"))(this);
    this.handlers["swap"] = new (require("./baseCommands/swap.js"))(this);
    this.handlers["ta"] = new (require("./baseCommands/ta.js"))(this);
    this.handlers["tmem"] = new (require("./baseCommands/tmem.js"))(this);
    this.handlers["tt"] = new (require("./baseCommands/tt.js"))(this);
    this.handlers["ul"] = new (require("./baseCommands/ul.js"))(this);
    this.handlers["us"] = new (require("./baseCommands/us.js"))(this);
    this.handlers["vol"] = new (require("./baseCommands/vol.js"))(this);
    this.handlers["vs"] = new (require("./baseCommands/vs.js"))(this);
    this.handlers["watch"] = new (require("./baseCommands/watch.js"))(this);
    this.handlers["wl"] = new (require("./baseCommands/wl.js"))(this);
    this.handlers["tp"] = new (require("./baseCommands/tp.js"))(this);
    this.handlers["save"] = new (require("./baseCommands/save.js"))(this);
}

CommandHandler.prototype.onCommand = function(enteredCommand, allCallback) {

    /**
     * Run all commands in the command given
     */
    async.mapSeries(this.splitStringBySemicolon(enteredCommand), function(command, callback) {

        var cSegs = command.split("||");

        var initialCommand = "";

        /**
         * The parts of the command
         * @type {String[]}
         */
        var cParts = [];

        var hasReachedPipe = false;

        for (var i = 0; i < cSegs.length; i++) {
            var splitOnPipes = cSegs[i].split(/[^\\]\|/);

            // console.log(splitOnPipes)

            if (!hasReachedPipe) {

                if (splitOnPipes.length > 1) {
                    hasReachedPipe = true;

                    initialCommand += splitOnPipes[0];

                    splitOnPipes.shift()
                } else {
                    initialCommand += cSegs[i];

                    if (i + 1 < cSegs.length) {
                        initialCommand += " || ";
                    }
                }
            }

            if (hasReachedPipe) {
                cParts = cParts.concat(splitOnPipes);
            }

        };

        cParts.unshift(initialCommand);

        /**
         * Is the command an internal command? (Does it start with a '\')
         */
        if (command.charAt(0) == "\\") {
            this.runInternalCommand(command.substring(1), cParts, callback);
            return;
        }

        /**
         * If we have got this far, it is not an internal command and should instead be ran on HANA
         */

        /**
         * Remove formatters off the end to send to hana
         */

        var sql = this.stripFormatterIdentifiers(initialCommand);

        /**
         * Run the initialCommand as a string of SQL and send it to HANA
         */
        this.hdb.exec("conn", sql, function(err, hanaData) {
            callback(null, [initialCommand, err == null ? 0 : 1, err == null ? hanaData : {
                    error: err,
                    sql: initialCommand
                },
                err == null ? "default" : "json"
            ]);
        })

    }.bind(this), function(err, data) {
        allCallback(err, data, enteredCommand);
    })
}

/**
 * Run a non SQL command from the 'baseCommands' folder
 */
CommandHandler.prototype.runInternalCommand = function(command, cParts, callback) {

    cParts[0] = this.stripFormatterIdentifiers(cParts[0].substring(1, cParts[0].length));

    var aParts = [];

    for (var i = 0; i < cParts.length; i++) {
        aParts = aParts.concat(cParts[i].split(" "));
    };

    /**
     * Does baseCommand exist?
     */
    if (!this.handlers[aParts[0]]) {
        callback(null, [1, null, "Invalid command! Try \\h", "message"]);
        return;
    }

    this.handlers[aParts[0]].run(command, aParts, this.hdb, this.screen, function(data) {
        data.unshift(command);
        callback(null, data)
    });

}

// inspired from here: http://stackoverflow.com/a/12920211/3110929
CommandHandler.prototype.splitStringBySemicolon = function(s) {

    /**
     * Reverse the string
     */
    var rev = s.split('').reverse().join('');

    /**
     * Only split on non escape semicolons.
     */
    var commands = rev.split(/;(?=[^\\])/g).reverse().map(function(s) {

        /**
         * Put string back into order and return string chunk
         */
        return s.split('').reverse().join('').trim();
    });

    for (var i = 0; i < commands.length; i++) {
        if (commands[i].replace(/ /g, '').length == 0) {
            commands.splice(i, 1);
        }
    };

    return commands;
}

CommandHandler.prototype.stripFormatterIdentifiers = function(string) {

    for (var i = 0; i < this.screen.formattersNames.length; i++) {

        var formatter = string.slice(string.lastIndexOf("\\")).substring(1)

        if (formatter.toLowerCase() == this.screen.formattersNames[i].toLowerCase()) {

            return string.substr(0, string.length - this.screen.formattersNames[i].length - 1);
        }
    };

    return string;
}

module.exports = CommandHandler;