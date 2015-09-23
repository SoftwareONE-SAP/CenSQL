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

            this.handlers[name] = new(require('../baseCommands/' + file))();

        }

    }.bind(this));
}

CommandHandler.prototype.onCommand = function(enteredCommand, allCallback) {

    // inspired from here: http://stackoverflow.com/a/12920211/3110929
    function splitStringBySemicolon(s) {

        /**
         * Reverse the string
         */
        var rev = s.split('').reverse().join('');

        /**
         * Only split on non escape semicolons.
         */
        return rev.split(/;(?=[^\\])/g).reverse().map(function(s) {

            /**
             * Put string back into order and return string chunk
             */
            return s.split('').reverse().join('');
        });
    }

    /**
     * Run all commands in the command given
     */
    async.mapSeries(splitStringBySemicolon(enteredCommand), function(command, callback) {
        /**
         * The parts of the command
         * @type {String[]}
         */
        var sqlCommand = command.replace(/([^\\])\|/g, "$1$1|").split(/[^\\]\|/)[0].trim();
        var cParts = sqlCommand.split(/\\| /);

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
         * Run the sqlCommand as a string of SQL and send it to HANA
         */
        this.conn.exec("conn", sqlCommand, function(err, hanaData) {
            callback(null, [err == null ? 0 : 1, err == null ? hanaData : {
                    error: err,
                    sql: sqlCommand
                },
                err == null ? "default" : "json"
            ]);
        })

    }.bind(this), function(err, data){
        allCallback(data, enteredCommand);
    })
}

/**
 * Run a non SQL command from the 'baseCommands' folder
 */
CommandHandler.prototype.runInternalCommand = function(command, cParts, callback) {

    cParts.splice(0, 1);

    /**
     * Does baseCommand exist?
     */
    if (!this.handlers[cParts[0]]) {
        callback([1, "Invalid command! Try \\h", "message", "message"]);
        return;
    }

    this.handlers[cParts[0]].run(command, cParts, this.conn, this.screen, function(data){
        callback(null, data)
    });

}

module.exports = CommandHandler;