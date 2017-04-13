var ms = require("ms");
var deasync = require('deasync');

var JsCommandHandler = function(commandHandler) {
    this.includeInAudit = false

    this.commandHandler = commandHandler;

    this.description = "Run JavaScript in the command line with access to the 'db' object";
}

JsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

    this.runJS(command.substring(3), conn, screen, function(output) {
        callback([0, output, "message"])
    }.bind(this));

}

JsCommandHandler.prototype.runJS = function(command, conn, screen, callback) {

    var output = "";

    try {
        output = this.evalInContext(command, {
            command: command,
            exec: this.syncExec(conn)
        })
    } catch (e) {
        output = e;
    }

    callback(output);

}

JsCommandHandler.prototype.evalInContext = function(js, context) {
    return function() {
        return eval("exec = this.exec; " + js);
    }.call(context);
}

JsCommandHandler.prototype.syncExec = function(conn) {

    return deasync(function(sql, cb) {
        conn.exec("conn", sql, function(err, out) {
            cb(err, out)
        });
    });
}


module.exports = JsCommandHandler;