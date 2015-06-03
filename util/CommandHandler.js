var debug = require("debug")("censql:CommandHandler");


var CommandHandler = function(screen, conn) {
    this.screen = screen;
    this.conn = conn;
    this.init.call(this);
}

CommandHandler.prototype.init = function(callback) {

}

CommandHandler.prototype.onCommand = function(command, callback) {

    if (command.charAt(0) == "\\") {
        this.runInternalCommand(command.substring(1), callback);
        return;
    }

    /**
     * If we have got this far, it is not an internal command and should instead be ran on HANA
     */

    this.conn.exec("conn", command, function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "table" : "json"]);
    })
}

CommandHandler.prototype.runInternalCommand = function(command, callback) {

    var cParts = command.split(/ /g);

    switch (cParts[0]) {
        case "h":
            callback([
                0, [
                    "CenSQL v1.0.0 Help",
                    "-----------------------------------------------------",
                    "\\h\t\t\t- For Help",
                    "\\sc\t\t\t- To list schemas",
                    "\\st\t\t\t- To list hosts for instance",
                    "\\in\t\t\t- To list instances",
                    "\\ta {SCHEMA_NAME}\t- To list lables for a schema",
                    "\\vs {SCHEMA_NAME}\t- To list views for a schema",
                    "\\ba {OPTIONAL_LIMIT}\t- To list recent backups",
                ].join("\n"),
                "message"
            ]);
            return;
            break;

        case "sc":
            this.conn.exec("conn", "SELECT * FROM SYS.SCHEMAS", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "\\g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "in":
            this.conn.exec("conn", "SELECT * FROM SYS.M_DATABASES", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "\\g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "ta":

            if(cParts.length < 2 || cParts[1].length == 0 || cParts[1].toLowerCase() == "\\g"){
                callback([1, "Invalid input! Try: \\h for help", "message"]);
                return;
            }

            this.conn.exec("conn", "SELECT * FROM SYS.TABLES WHERE SCHEMA_NAME LIKE '" + cParts[1] + "'", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "\\g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "vs":

            if(cParts.length < 2 || cParts[1].length == 0 || cParts[1].toLowerCase() == "\\g"){
                callback([1, "Invalid input! Try: \\h for help", "message"]);
                return;
            }

            this.conn.exec("conn", "SELECT VIEW_NAME, VIEW_OID, IS_READ_ONLY, COMMENTS FROM SYS.VIEWS WHERE SCHEMA_NAME LIKE '" + cParts[1] + "'", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "\\g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "st":
            this.conn.exec("conn", 
                "SELECT HOST,HOST_ACTIVE,HOST_STATUS FROM SYS.M_LANDSCAPE_HOST_CONFIGURATION", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "\\g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "ba":

            this.conn.exec("conn", "SELECT BACKUP_ID, UTC_START_TIME, STATE_NAME FROM sys.m_backup_catalog\
                 WHERE ENTRY_TYPE_NAME = 'complete data backup'\
                 ORDER BY entry_id DESC\
                 LIMIT " + parseInt(cParts[1] && cParts[1].toLowerCase() != "\\g" ? cParts[1] : 10), function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "\\g" ? "group" : "table") : "json"]);
            })
            return;
            break;
    }

    callback([1, "Invalid command! Try \\h", "message", "message"]);
}

module.exports = CommandHandler;