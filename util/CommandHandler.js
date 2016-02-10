var async = require("async");

var CommandHandler = function(screen, conn, command) {
    this.screen = screen;
    this.conn = conn;

    this.loadCommandHandlers();

    if (command) {
        this.onCommand(command, function(output) {
            this.screen.printCommandOutput(command, output);
            process.exit(0)
        }.bind(this));
    }

}

/**
 * Require the baseCommands from the baseCommands folder and save them by their file name
 */
CommandHandler.prototype.loadCommandHandlers = function() {

    this.handlers = {};

    require('fs').readdirSync(__dirname + '/../baseCommands/').forEach(function(file) {

        if (file.match(/\.js$/) !== null) {

            var name = file.replace('.js', '');

            this.handlers[name] = new(require('../baseCommands/' + file))(this);

        }

    }.bind(this));
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

        //- /[^\\]\|/        

        for (var i = 0; i < cSegs.length; i++) {
            var splitOnPipes = cSegs[i].split(/[^\\]\|/);

            initialCommand += cSegs[i] + "||";

            cParts = cParts.concat(splitOnPipes);
        };

        /**
         * The initial command before any pipes
         * @type {String}
         */
        initialCommand = initialCommand.substring(0, initialCommand.length - 2).trim();

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
        this.conn.exec("conn", sql, function(err, hanaData) {
            callback(null, [initialCommand, err == null ? 0 : 1, err == null ? hanaData : {
                    error: err,
                    sql: initialCommand
                },
                err == null ? "default" : "json"
            ]);
        })

    }.bind(this), function(err, data) {
        allCallback(data, enteredCommand);
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

    this.handlers[aParts[0]].run(command, aParts, this.conn, this.screen, function(data) {
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
        return s.split('').reverse().join('');
    });

    for (var i = 0; i < commands.length; i++) {
        if (commands[i].replace(/ /g, '').length == 0) {
            commands.splice(i, 1);
        }
    };

    return commands;
}

CommandHandler.prototype.stripFormatterIdentifiers = function(string){

    for (var i = 0; i < this.screen.formattersNames.length; i++) {

        var formatter = string.slice(string.lastIndexOf("\\")).substring(1)

        if(formatter.toLowerCase() == this.screen.formattersNames[i].toLowerCase()){

            return string.substr(0, string.length - this.screen.formattersNames[i].length - 1);
        }
    };

    return string;
}

module.exports = CommandHandler;