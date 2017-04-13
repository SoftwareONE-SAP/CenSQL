var async = require("async");
var path = require("path");

var CommandHandler = function(screen, hdb, command, settings) {
    this.screen = screen;
    this.hdb = hdb;
    this.settings = settings;

    this.loadCommandHandlers();
}

/**
 * Require the baseCommands from the baseCommands folder and save them by their file name
 */
CommandHandler.prototype.loadCommandHandlers = function() {

    this.handlers = {};

    this.handlers["ad"] = new(require("./baseCommands/ad.js"))(this);
    this.handlers["ag"] = new(require("./baseCommands/ag.js"))(this);
    this.handlers["al"] = new(require("./baseCommands/al.js"))(this);
    this.handlers["as"] = new(require("./baseCommands/as.js"))(this);
    this.handlers["audit"] = new(require("./baseCommands/audit.js"))(this);
    this.handlers["ba"] = new(require("./baseCommands/ba.js"))(this);
    this.handlers["blame"] = new(require("./baseCommands/blame.js"))(this);
    this.handlers["col"] = new(require("./baseCommands/col.js"))(this);
    this.handlers["con"] = new(require("./baseCommands/con.js"))(this);
    this.handlers["cpu"] = new(require("./baseCommands/cpu.js"))(this);
    this.handlers["csc"] = new(require("./baseCommands/csc.js"))(this);
    this.handlers["csd"] = new(require("./baseCommands/csd.js"))(this);
    this.handlers["csm"] = new(require("./baseCommands/csm.js"))(this);
    this.handlers["csr"] = new(require("./baseCommands/csr.js"))(this);
    this.handlers["csw"] = new(require("./baseCommands/csw.js"))(this);
    this.handlers["df"] = new(require("./baseCommands/df.js"))(this);
    this.handlers["di"] = new(require("./baseCommands/di.js"))(this);
    this.handlers["disk"] = new(require("./baseCommands/disk.js"))(this);
    this.handlers["ds"] = new(require("./baseCommands/ds.js"))(this);
    this.handlers["dt"] = new(require("./baseCommands/dt.js"))(this);
    this.handlers["du"] = new(require("./baseCommands/du.js"))(this);
    this.handlers["dv"] = new(require("./baseCommands/dv.js"))(this);
    this.handlers["fn"] = new(require("./baseCommands/fn.js"))(this);
    this.handlers["h"] = new(require("./baseCommands/h.js"))(this);
    this.handlers["head"] = new(require("./baseCommands/head.js"))(this);
    this.handlers["help"] = new(require("./baseCommands/help.js"))(this);
    this.handlers["history"] = new(require("./baseCommands/history.js"))(this);
    this.handlers["hmem"] = new(require("./baseCommands/hmem.js"))(this);
    this.handlers["imem"] = new(require("./baseCommands/imem.js"))(this);
    this.handlers["in"] = new(require("./baseCommands/in.js"))(this);
    this.handlers["ips"] = new(require("./baseCommands/ips.js"))(this);
    this.handlers["js"] = new(require("./baseCommands/js.js"))(this);
    this.handlers["li"] = new(require("./baseCommands/li.js"))(this);
    this.handlers["logb"] = new(require("./baseCommands/logb.js"))(this);
    this.handlers["logs"] = new(require("./baseCommands/logs.js"))(this);
    this.handlers["lrq"] = new(require("./baseCommands/lrq.js"))(this);
    this.handlers["lrs"] = new(require("./baseCommands/lrs.js"))(this);
    this.handlers["mem"] = new(require("./baseCommands/mem.js"))(this);
    this.handlers["ms"] = new(require("./baseCommands/ms.js"))(this);
    this.handlers["part"] = new(require("./baseCommands/part.js"))(this);
    this.handlers["passwd"] = new(require("./baseCommands/passwd.js"))(this);
    this.handlers["ping"] = new(require("./baseCommands/ping.js"))(this);
    this.handlers["priv"] = new(require("./baseCommands/priv.js"))(this);
    this.handlers["pwl"] = new(require("./baseCommands/pwl.js"))(this);
    this.handlers["rep"] = new(require("./baseCommands/rep.js"))(this);
    this.handlers["roles"] = new(require("./baseCommands/roles.js"))(this);
    this.handlers["row"] = new(require("./baseCommands/row.js"))(this);
    this.handlers["rs"] = new(require("./baseCommands/rs.js"))(this);
    this.handlers["save"] = new(require("./baseCommands/save.js"))(this);
    this.handlers["sc"] = new(require("./baseCommands/sc.js"))(this);
    this.handlers["scpu"] = new(require("./baseCommands/scpu.js"))(this);
    this.handlers["serv"] = new(require("./baseCommands/serv.js"))(this);
    this.handlers["settings"] = new(require("./baseCommands/settings.js"))(this);
    this.handlers["smem"] = new(require("./baseCommands/smem.js"))(this);
    this.handlers["spec"] = new(require("./baseCommands/spec.js"))(this);
    this.handlers["st"] = new(require("./baseCommands/st.js"))(this);
    this.handlers["stor"] = new(require("./baseCommands/stor.js"))(this);
    this.handlers["swap"] = new(require("./baseCommands/swap.js"))(this);
    this.handlers["ta"] = new(require("./baseCommands/ta.js"))(this);
    this.handlers["tail"] = new(require("./baseCommands/tail.js"))(this);
    this.handlers["tf"] = new(require("./baseCommands/tf.js"))(this);
    this.handlers["tfc"] = new(require("./baseCommands/tfc.js"))(this);
    this.handlers["time"] = new(require("./baseCommands/time.js"))(this);
    this.handlers["tmem"] = new(require("./baseCommands/tmem.js"))(this);
    this.handlers["tp"] = new(require("./baseCommands/tp.js"))(this);
    this.handlers["tt"] = new(require("./baseCommands/tt.js"))(this);
    this.handlers["ttp"] = new(require("./baseCommands/ttp.js"))(this);
    this.handlers["ul"] = new(require("./baseCommands/ul.js"))(this);
    this.handlers["us"] = new(require("./baseCommands/us.js"))(this);
    this.handlers["vol"] = new(require("./baseCommands/vol.js"))(this);
    this.handlers["vs"] = new(require("./baseCommands/vs.js"))(this);
    this.handlers["watch"] = new(require("./baseCommands/watch.js"))(this);
    this.handlers["wl"] = new(require("./baseCommands/wl.js"))(this);
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

            // if (hasReachedPipe) {
            //     cParts = cParts.concat(splitOnPipes);
            // }

        };

        cParts.unshift(initialCommand);

        // console.log(cParts)

        /**
         * Is the command an internal command? (Does it start with a '\')
         */
        if (command.charAt(0) == "\\") {
            this.runInternalCommand(command.substring(1), cParts, function(err, output){

                if(output[1] == 1){
                    output[2].command = command;
                }

                callback(err, output);
            });
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

            if(err){
                err.sql = sql;
            }

            callback(null, [initialCommand, err == null ? 0 : 1, err == null ? hanaData : err,
                err == null ? "default" : "sql-error"
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

// inspired by: http://stackoverflow.com/a/12920211/3110929
CommandHandler.prototype.splitStringBySemicolon = function(s) {

    /**
     * Dont split javascript by semicolon, this is a rubbish fix and should be replaced.
     */
    if(s.substring(4, -1) === "\\js "){
        return [s];
    }

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

/**
 * Remove format commands from the end of commands/queries such as \g or \csv
 */
CommandHandler.prototype.stripFormatterIdentifiers = function(string) {

    for (var i = 0; i < this.screen.formattersNames.length; i++) {

        var formatter = string.slice(string.lastIndexOf("\\")).substring(1)

        if (formatter.toLowerCase() == this.screen.formattersNames[i].toLowerCase()) {

            return string.substr(0, string.length - this.screen.formattersNames[i].length - 1);
        }
    };

    return string;
}

CommandHandler.prototype.getActiveSchema = function(callback){
    this.hdb.exec("conn", "SELECT CURRENT_SCHEMA FROM DUMMY", function(err, data){
        if(err){
            callback(err, null);
            return;
        }

        callback(null, data[0].CURRENT_SCHEMA);
    })
}

module.exports = CommandHandler;