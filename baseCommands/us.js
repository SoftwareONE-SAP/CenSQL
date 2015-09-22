
var UserViewCommandHandler = function(){
	this.description = "";
}

UserViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	conn.exec("conn", "SELECT USER_ID, USER_NAME, USER_MODE, LAST_SUCCESSFUL_CONNECT, USER_DEACTIVATED FROM SYS.USERS", function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "json"]);
	})
}

module.exports = UserViewCommandHandler;