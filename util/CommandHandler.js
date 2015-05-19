var debug = require("debug")("censql:CommandHandler");


var CommandHandler = function(screen, conn) {
    this.screen = screen;
    this.conn = conn;
    this.init.call(this);
}

CommandHandler.prototype.init = function(callback) {

}

CommandHandler.prototype.onCommand = function(command, callback) {

    if(command.charAt(0) == "\\"){
        callback(this.runInternalCommand(command.substring(1)));
        return;
    }

    /**
     * If we have got this far, it is not an internal command and should instead be ran on HANA
     */
    
    this.conn.exec("conn", command, function(err, data){
        callback([err == null ? 0 : 1, err == null ? data : err, "table"]);
    })
}

CommandHandler.prototype.runInternalCommand = function(command){
    switch(command){
        case "h":
            return [
                0, 
                [
                    "CenSQL v1.0.0 Help",
                    "-------------------",
                    "\\h\t- For Help",
                    // "\\s\t- For Status"
                ].join("\n"), 
                "message"
            ];
            break;
    }

    return [1, "Invalid command! Try \\h", "message"];
}

module.exports = CommandHandler;