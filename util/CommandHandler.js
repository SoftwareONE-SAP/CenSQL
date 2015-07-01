var debug = require("debug")("censql:CommandHandler");


var CommandHandler = function(screen, conn, command) {
    this.screen = screen;
    this.conn = conn;

    this.loadCommandHandlers();

    if(command){
        this.onCommand(command, function(output){
            this.screen.printCommandOutput(command, output);
            process.exit(0)
        }.bind(this));
    }

}

CommandHandler.prototype.loadCommandHandlers = function(){

    this.handlers = {};

    require('fs').readdirSync(__dirname + '/../baseCommands/').forEach(function(file) {

        if (file.match(/\.js$/) !== null) {

            var name = file.replace('.js', '');

            this.handlers[name] = new (require('../baseCommands/' + file))();

        }

    }.bind(this));
}

CommandHandler.prototype.onCommand = function(command, callback) {

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
     * Should the data be shown in a group view?
     * @type {Boolean}
     */
    var isGroupOption = false;

    if(sqlCommand.toLowerCase().slice(-2) == "\\g"){
        isGroupOption = true;
        sqlCommand = sqlCommand.substring(0, sqlCommand.length - 2);
    }

    console.log(sqlCommand);

    /**
     * Run the sqlCommand as a string of SQL and send it to HANA
     */
    this.conn.exec("conn", sqlCommand, function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : {error: err, sql: sqlCommand}, err == null ? (isGroupOption ? "group" : "table") : "json"]);
    })
}

CommandHandler.prototype.runInternalCommand = function(command, cParts, callback) {

    cParts.splice(0, 1);

    if(!this.handlers[cParts[0]]){
        callback([1, "Invalid command! Try \\h", "message", "message"]);
        return;
    }

    this.handlers[cParts[0]].run(command, cParts, this.conn, this.screen, callback);

}

module.exports = CommandHandler;