
var UnloadsCommandHandler = function(){
	this.description = "";
	this.helpText = "";
}

UnloadsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	var isGroupView = cParts[cParts.length - 1].toLowerCase() == "g"

	conn.exec("conn", "SELECT CONCAT(CONCAT(CONCAT(CONCAT(CONCAT(CONCAT(CONCAT(YEAR(UNLOAD_TIME), '-'), MONTH(UNLOAD_TIME)), '-'), DAYOFMONTH(UNLOAD_TIME)), ' '), HOUR(UNLOAD_TIME)), ':**:**') AS TIME, HOST, COUNT(*) AS \"COLUMNS IN HOUR\"\
        FROM SYS.M_CS_UNLOADS\
        GROUP BY YEAR(UNLOAD_TIME), MONTH(UNLOAD_TIME), DAYOFMONTH(UNLOAD_TIME), HOUR(UNLOAD_TIME), HOST\
        ORDER BY MONTH(UNLOAD_TIME) DESC, DAYOFMONTH(UNLOAD_TIME) DESC, HOUR(UNLOAD_TIME) DESC, HOST DESC\
        LIMIT " + parseInt(cParts[1] && cParts[1].toLowerCase() != "\\g" ? cParts[1] : 10), 
    function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (isGroupView ? "group" : "table") : "json"]);
	})
}

module.exports = UnloadsCommandHandler;