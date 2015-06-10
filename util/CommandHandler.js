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

    var isGroupOption = false;

    if(command.toLowerCase().slice(-2) == "\\g"){
        isGroupOption = true;
        command = command.substring(0, command.length - 2);
    }

    this.conn.exec("conn", command, function(err, data) {
        callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (isGroupOption ? "group" : "table") : "json"]);
    })
}

CommandHandler.prototype.runInternalCommand = function(command, callback) {

    var cParts = command.split(/\\| /);

    switch (cParts[0]) {
        case "h":
            callback([
                0, [
                    "CenSQL v1.0.0 Help",
                    "-----------------------------------------------------",
                    "\\h\t\t\t- For Help",
                    "\\sc\t\t\t- To list schemas",
                    "\\st\t\t\t- To list hosts for instance",
                    "\\ta {SCHEMA_NAME}\t- To list tables for a schema",
                    "\\vs {SCHEMA_NAME}\t- To list views for a schema",
                    "\\in\t\t\t- To list instances",
                    "",
                    "History:",
                    "\\mem\t\t\t- Graph physical memory over the last 3 days",
                    "\\imem\t\t\t- Graph instance used memory over the last 3 days",
                    "\\cpu\t\t\t- Graph cpu over the last 3 days",
                    "\\swap\t\t\t- Graph swap over the last 3 days",
                    "\\row\t\t\t- Graph the used fixed part size for row storage over the last 3 days",
                    "\\csd\t\t\t- Graph CS in memory delta over the last 3 days",
                    "\\csr\t\t\t- Graph CS read count over the last 3 days",
                    "\\csw\t\t\t- Graph CS write count over the last 3 days",
                    "\\csc\t\t\t- Graph CS record count over the last 3 days",
                    "\\csm\t\t\t- Graph CS in memory size total (incl delta) over the last 3 days",
                    "",
                    "Current Status:",
                    "\\al\t\t\t- To list active alerts",
                    "\\con\t\t\t- To list connections",
                    "\\serv\t\t\t- To list services",
                    "\\tt {OPTIONAL_LIMIT}\t- To list the largest column tables",
                    "\\ba {OPTIONAL_LIMIT}\t- To list recent backups",
                    "\\smem\t\t\t- Show bar chart of shared memeory",
                    "\\hmem\t\t\t- Show bar chart of heap memory usage per service",
                    "\\tmem\t\t\t- Show bar chart of total memory usage per service",
                ].join("\n"),
                "message"
            ]);
            return;
            break;

        case "sc":
            this.conn.exec("conn", "SELECT * FROM SYS.SCHEMAS", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "serv":
            this.conn.exec("conn", "SELECT * FROM SYS.M_SERVICES", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "in":
            this.conn.exec("conn", "SELECT * FROM SYS.M_DATABASES", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "ta":

            if(cParts.length < 2 || cParts[1].length == 0 || cParts[1].toLowerCase() == "\\g"){
                callback([1, "Invalid input! Try: \\h for help", "message"]);
                return;
            }

            this.conn.exec("conn", "SELECT * FROM SYS.TABLES WHERE SCHEMA_NAME LIKE '" + cParts[1] + "'", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "vs":

            if(cParts.length < 2 || cParts[1].length == 0 || cParts[1].toLowerCase() == "\\g"){
                callback([1, "Invalid input! Try: \\h for help", "message"]);
                return;
            }

            this.conn.exec("conn", "SELECT VIEW_NAME, VIEW_OID, IS_READ_ONLY, COMMENTS FROM SYS.VIEWS WHERE SCHEMA_NAME LIKE '" + cParts[1] + "'", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "st":
            this.conn.exec("conn", 
                "SELECT HOST,HOST_ACTIVE,HOST_STATUS FROM SYS.M_LANDSCAPE_HOST_CONFIGURATION", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "ba":

            this.conn.exec("conn", "SELECT BACKUP_ID, UTC_START_TIME, STATE_NAME FROM sys.m_backup_catalog\
                 WHERE ENTRY_TYPE_NAME = 'complete data backup'\
                 ORDER BY entry_id DESC\
                 LIMIT " + parseInt(cParts[1] && cParts[1].toLowerCase() != "\\g" ? cParts[1] : 10), function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "al":
            this.conn.exec("conn", "SELECT ALERT_TIMESTAMP, ALERT_RATING, ALERT_NAME, ALERT_DETAILS, INDEX FROM _SYS_STATISTICS.STATISTICS_CURRENT_ALERTS", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "mem":

            this.conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, MAX(USED_PHYSICAL_MEMORY), MIN(SNAPSHOT_ID)\
                FROM _SYS_STATISTICS.HOST_RESOURCE_UTILIZATION_STATISTICS\
                WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
                GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
                ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "Memory usage over the last 3 days"]);
            })

            return;
            break;

        case "imem":

            this.conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, MAX(INSTANCE_TOTAL_MEMORY_USED_SIZE), MIN(SNAPSHOT_ID)\
                FROM _SYS_STATISTICS.HOST_RESOURCE_UTILIZATION_STATISTICS\
                WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
                GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
                ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "Memory usage over the last 3 days"]);
            })

            return;
            break;

        case "swap":

            this.conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, MAX(USED_SWAP_SPACE), MIN(SNAPSHOT_ID)\
                FROM _SYS_STATISTICS.HOST_RESOURCE_UTILIZATION_STATISTICS\
                WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
                GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
                ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "Swap usage over the last 3 days"]);
            })

            return;
            break;

        case "cpu":

            this.conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, MAX(TOTAL_CPU_USER_TIME_DELTA + TOTAL_CPU_SYSTEM_TIME_DELTA + TOTAL_CPU_WIO_TIME_DELTA), MIN(SNAPSHOT_ID)\
                FROM _SYS_STATISTICS.HOST_RESOURCE_UTILIZATION_STATISTICS\
                WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
                GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
                ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "CPU usage over the last 3 days"]);
            })

            return;
            break;

        case "row":

            this.conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, SUM(USED_FIXED_PART_SIZE), MIN(SNAPSHOT_ID)\
                FROM _SYS_STATISTICS.GLOBAL_ROWSTORE_TABLES_SIZE\
                WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
                GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
                ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "RS used fixed part size over the last 3 days"]);
            })

            return;
            break;

        case "csm":

            this.conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, SUM(MEMORY_SIZE_IN_TOTAL), MIN(SNAPSHOT_ID)\
                FROM _SYS_STATISTICS.HOST_COLUMN_TABLES_PART_SIZE\
                WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
                GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
                ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "CS memory total over the last 3 days"]);
            })

            return;
            break;

        case "csc":

            this.conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, SUM(RECORD_COUNT), MIN(SNAPSHOT_ID)\
                FROM _SYS_STATISTICS.HOST_COLUMN_TABLES_PART_SIZE\
                WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
                GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
                ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "CS record count over the last 3 days"]);
            })

            return;
            break;

        case "csd":

            this.conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, SUM(MEMORY_SIZE_IN_DELTA), MIN(SNAPSHOT_ID)\
                FROM _SYS_STATISTICS.HOST_COLUMN_TABLES_PART_SIZE\
                WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
                GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
                ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "CS in memory delta over the last 3 days"]);
            })

            return;
            break;

        case "csr":

            this.conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, SUM(READ_COUNT), MIN(SNAPSHOT_ID)\
                FROM _SYS_STATISTICS.HOST_COLUMN_TABLES_PART_SIZE\
                WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
                GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
                ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "CS read count over the last 3 days"]);
            })

            return;
            break;

        case "csw":

            this.conn.exec("conn", "SELECT MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST, SUM(WRITE_COUNT), MIN(SNAPSHOT_ID)\
                FROM _SYS_STATISTICS.HOST_COLUMN_TABLES_PART_SIZE\
                WHERE SNAPSHOT_ID > ADD_DAYS(CURRENT_TIMESTAMP, -3)\
                GROUP BY MONTH(SNAPSHOT_ID), DAYOFMONTH(SNAPSHOT_ID), HOUR(SNAPSHOT_ID), HOST\
                ORDER BY MONTH(SNAPSHOT_ID) DESC, DAYOFMONTH(SNAPSHOT_ID) DESC, HOUR(SNAPSHOT_ID) DESC, HOST DESC", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "line-graph" : "json", "CS read count over the last 3 days"]);
            })

            return;
            break;

        case "tt":
            this.conn.exec("conn", "SELECT SCHEMA_NAME, TABLE_NAME, LOADED, MEMORY_SIZE_IN_TOTAL, ESTIMATED_MAX_MEMORY_SIZE_IN_TOTAL FROM SYS.M_CS_TABLES ORDER BY MEMORY_SIZE_IN_TOTAL DESC, MEMORY_SIZE_IN_DELTA DESC LIMIT " + parseInt(cParts[1] && cParts[1].toLowerCase() != "\\g" ? cParts[1] : 10), function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "con":
            this.conn.exec("conn", "SELECT HOST, USER_NAME, COUNT(*) AS AMOUNT FROM SYS.M_CONNECTIONS WHERE CONNECTION_STATUS = 'RUNNING' OR CONNECTION_STATUS = 'IDLE' GROUP BY HOST, USER_NAME", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? (cParts[cParts.length - 1].toLowerCase().slice(-2) == "g" ? "group" : "table") : "json"]);
            })
            return;
            break;

        case "smem":
            this.conn.exec("conn", "SELECT CONCAT(CONCAT(HOST, ' - ') , PORT) AS HOST, NAME, VALUE FROM M_MEMORY WHERE NAME IN ('SHARED_MEMORY_USED_SIZE', 'SHARED_MEMORY_FREE_SIZE')", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "key-value-bar-chart" : "json", "Shared Memory Usage"]);
            })
            return;
            break;

        case "hmem":
            this.conn.exec("conn", "SELECT CONCAT(CONCAT(HOST, ' - ') , SERVICE_NAME), HEAP_MEMORY_USED_SIZE, HEAP_MEMORY_ALLOCATED_SIZE - HEAP_MEMORY_USED_SIZE FROM M_SERVICE_MEMORY", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "bar-chart" : "json", "Heap Memory Usage"]);
            })
            return;
            break;

        case "tmem":
            this.conn.exec("conn", "SELECT CONCAT(CONCAT(HOST, ' - ') , SERVICE_NAME), TOTAL_MEMORY_USED_SIZE, EFFECTIVE_ALLOCATION_LIMIT - TOTAL_MEMORY_USED_SIZE FROM M_SERVICE_MEMORY", function(err, data) {
                callback([err == null ? 0 : 1, err == null ? data : err, err == null ? "bar-chart" : "json", "Total Memory Usage"]);
            })
            return;
            break;

        
    }

    callback([1, "Invalid command! Try \\h", "message", "message"]);
}

module.exports = CommandHandler;