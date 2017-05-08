var DLMCommandHandler = function() {
	this.includeInAudit = true
}

DLMCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

	this.argv = require('optimist')(cParts).argv;

	if (this.argv._.length <= 1) {
		callback([0, "Run \\h for help with using the DLM command", "message"]);
		return;
	}

	switch (this.argv._[1]) {
		case "profiles":
			this.showProfiles(command, cParts, conn, screen, callback);
			break;
		case "log":
			this.showRunLog(command, cParts, conn, screen, callback);
			break;
		case "destinations":
			this.showDestinations(command, cParts, conn, screen, callback);
			break;
		default:
			callback([0, "Run \\h for help with using the DLM command", "message"]);
			break;
	}
}

DLMCommandHandler.prototype.showProfiles = function(command, cParts, conn, screen, callback) {

	var rowLimit = 50;

	if (this.argv._.length > 2 && !isNaN(this.argv._[2])) {
		rowLimit = parseInt(this.argv._[2]);
	}

	conn.exec("conn", 'SELECT * FROM SAP_HDM_DLM."sap.hdm.dlm.core.db::DLM_PROFILE"ORDER BY ID ASC LIMIT ' + rowLimit, function(err, data) {
		callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

DLMCommandHandler.prototype.showRunLog = function(command, cParts, conn, screen, callback) {

	var rowLimit = 10;

	if (this.argv._.length > 2 && !isNaN(this.argv._[2])) {
		rowLimit = parseInt(this.argv._[2]);
	}

	conn.exec("conn", 'SELECT R.ID, P.NAME, R.START_TIME, R.END_TIME, SECONDS_BETWEEN(R.START_TIME, R.END_TIME) AS DURATION, R.RUN_STATUS, R.ESTIMATED_RECORDS_PROCESS_COUNT FROM SAP_HDM_DLM."sap.hdm.dlm.core.db::DLM_RUN" AS R JOIN SAP_HDM_DLM."sap.hdm.dlm.core.db::DLM_PROFILE" AS P ON (R.DLM_PROFILE_ID = P.ID) ORDER BY R.START_TIME DESC LIMIT ' + rowLimit, function(err, data) {
		callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

DLMCommandHandler.prototype.showDestinations = function(command, cParts, conn, screen, callback) {

	var rowLimit = 10;

	if (this.argv._.length > 2 && !isNaN(this.argv._[2])) {
		rowLimit = parseInt(this.argv._[2]);
	}

	conn.exec("conn", 'SELECT P.ID, P.NAME, P.STORAGE_DESTINATION_ID AS STORAGE_ID, S.NAME AS STORAGE_NAME FROM SAP_HDM_DLM."sap.hdm.dlm.destination.db::DLM_STORAGE_DESTINATION_PROFILE" AS P JOIN SAP_HDM_DLM."sap.hdm.dlm.destination.db::DLM_STORAGE_DESTINATION" AS S ON (S.ID = P.STORAGE_DESTINATION_ID) ORDER BY ID ASC LIMIT ' + rowLimit, function(err, data) {
		callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = DLMCommandHandler;