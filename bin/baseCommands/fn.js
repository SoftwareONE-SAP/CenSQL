
var FunctionsViewCommandHandler = function(){
	this.includeInAudit = false
}

FunctionsViewCommandHandler.prototype.run = function(command, cParts, conn, screen, callback){

	if(!cParts[1]){
		cParts[1] = "CURRENT_SCHEMA";
	}else{
		cParts[1] = "'" + cParts[1] + "'";
	}

	var sql = "SELECT \n\
		F.FUNCTION_OID AS OID, \n\
		MAX(F.FUNCTION_NAME) AS NAME, \n\
		CASE WHEN STRING_AGG(P.PARAMETER_NAME, ', ') IS NULL THEN '' ELSE STRING_AGG(P.PARAMETER_NAME, ', ') END AS INPUTS, \n\
		CASE WHEN STRING_AGG(R.PARAMETER_NAME, ', ') IS NULL THEN '' ELSE STRING_AGG(R.PARAMETER_NAME, ', ') END AS OUTPUTS, \n\
		MAX(F.OWNER_NAME) AS OWNER, \n\
		MIN(f.IS_VALID) AS VALID \n\
		FROM SYS.FUNCTIONS AS F \n\
		LEFT JOIN SYS.FUNCTION_PARAMETERS AS P ON (F.FUNCTION_OID = P.FUNCTION_OID AND P.PARAMETER_TYPE = 'IN') \n\
		LEFT JOIN SYS.FUNCTION_PARAMETERS AS R ON (F.FUNCTION_OID = R.FUNCTION_OID AND R.PARAMETER_TYPE = 'RETURN') \n\
		WHERE F.SCHEMA_NAME LIKE " + cParts[1] + " \n\
		GROUP BY F.FUNCTION_OID";

	conn.exec("conn", sql, function(err, data) {
	    callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "default" : "sql-error"]);
	})
}

module.exports = FunctionsViewCommandHandler;