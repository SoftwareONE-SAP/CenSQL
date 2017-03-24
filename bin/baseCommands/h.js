var colors = require("colors");
var package = require("../../package.json");

var HelpCommandHandler = function() {
    this.description = "";
}

HelpCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

    callback(
        [
            0, [
                colors.bold(colors.green("CenSQL " + package.version) + " Help"),
                (new Array(global.censql.graphWidth + 1).join("-")),
                colors.bold("Commands:"),
                colors.bold("\tBasic:"),
                "\t\\h\t\t\t\t\t- For Help",
                "\t\\sc, \\ds\t\t\t\t- To list schemas",
                "\t\\us, \\du\t\t\t\t- To list users",
                "\t\\ta, \\dt {SCHEMA_NAME}" + "\t\t\t- To list tables in a schema",
                "\t\\vs, \\dv {SCHEMA_NAME}" + "\t\t\t- To list views in a schema",
                "\t\\fn, \\df {SCHEMA_NAME}" + "\t\t\t- To list functions in a schema",
                "\t\\col, \\di {SCHEMA_NAME}.{TABLE_NAME}" + "\t- To show columns/indexes of a table",
                "\t\\part {SCHEMA_NAME}.{TABLE_NAME}" + "\t- To show the partitions of a table",
                "\t\\in\t\t\t\t\t- To list instances",
                "",
                colors.bold("\tHistory:"),
                "\t\\ba " + colors.grey("{OPTIONAL_LIMIT}") + "\t- List recent backups",
                "\t\\logb " + colors.grey("{OPTIONAL_LIMIT}") + "\t- List recent log backups",
                "\t\\ul " + colors.grey("{OPTIONAL_LIMIT}") + "\t- To list recent unloads",
                "\t\\lrs " + colors.grey("-t {OPTIONAL_TIME_THRESHOLD}") + " " + colors.grey("{OPTIONAL_LIMIT}") + " - To list long running statements. Default time threshold is 30 seconds.",
                "\t\\lrq " + colors.grey("-t {OPTIONAL_TIME_THRESHOLD}") + " " + colors.grey("{OPTIONAL_LIMIT}") + " - To list long running queries. Default time threshold is 30 seconds.",
                "\t\\mem " + colors.grey("-r (relative)") + "\t- Graph physical memory over the last 3 days",
                "\t\\imem " + colors.grey("-r (relative)") + "\t- Graph instance used memory over the last 3 days",
                "\t\\cpu " + colors.grey("-r (relative)") + "\t- Graph cpu over the last 3 days",
                "\t\\swap " + colors.grey("-r (relative)") + "\t- Graph swap over the last 3 days",
                "\t\\row " + colors.grey("-r (relative)") + "\t- Graph the used fixed part size for row storage over the last 3 days",
                "\t\\csd " + colors.grey("-r (relative)") + "\t- Graph column storage delta over the last 3 days",
                "\t\\csr " + colors.grey("-r (relative)") + "\t- Graph column storage read count over the last 3 days",
                "\t\\csw " + colors.grey("-r (relative)") + "\t- Graph column storage write count over the last 3 days",
                "\t\\csc " + colors.grey("-r (relative)") + "\t- Graph column table record count over the last 3 days",
                "\t\\csm " + colors.grey("-r (relative)") + "\t- Graph column storage memory size total (incl delta) over the last 3 days",
                "\t\\blame {USER_NAME} " + colors.grey("{OPTIONAL_LIMIT}") + " - List recent commands run by a user",
                "",
                colors.bold("\tCurrent Status:"),
                "\t\\al " + colors.grey("{OPTIONAL_MIN_RATING}") + "\t- List active alerts",
                "\t\\as " + colors.grey("{OPTIONAL_LIMIT}") + "\t\t- List active statements",
                "\t\\st\t\t\t\t- List hosts for instance",
                "\t\\con\t\t\t\t- List connections",
                "\t\\serv\t\t\t\t- List services",
                "\t\\tt " + colors.grey("-s {OPTIONAL_SCHEMA}") + " " + colors.grey("{OPTIONAL_LIMIT}") + "\t\t\t\t- List the largest tables",
                "\t\\ttp " + colors.grey("-s {OPTIONAL_SCHEMA} -r (relative) -c (row count)") + " " + colors.grey("{OPTIONAL_LIMIT}") + "\t- Show the percentage size of the largest tables",
                "\t\\smem\t\t\t- Show bar chart of shared memory (deprecated)",
                "\t\\hmem\t\t\t- Show bar chart of heap memory usage per service",
                "\t\\tmem\t\t\t- Show bar chart of total memory usage per service",
                "\t\\scpu\t\t\t- Show bar chart of cpu usage per service",
                "\t\\rep\t\t\t- Show current replication status",
                "\t\\stor\t\t\t- Show the current storage usage",
                "\t\\disk\t\t\t- List disks by host",
                "\t\\wl\t\t\t- Show the current instance workload ('current' being the last time HANA updated this metric)",
                "\t\\pwl\t\t\t- Show the peak instance workload",
                "\t\\vol\t\t\t- Show the current size and fragmentation of each data volume",
                "\t\\logs\t\t\t- List all log files",
                "\t\\li\t\t\t- Show the license status and expirary time",
                "\t\\ips {SCHEMA_NAME} [-f | --forever] " + colors.grey("{OPTIONAL_SLEEP}") + "\t- Show the current inserts per second",
                "\t\\ping "+ colors.grey("[-f | --forever] {OPTIONAL_SLEEP}") + "\t\t\t- Test how long it takes to connect to HANA.",
                "",
                colors.bold("\tData Provisioning:"),
                "\t\\ag\t\t\t- List all connected SDI agents",
                "\t\\ad\t\t\t- List all registered SDI adapters",
                "\t\\rs\t\t\t- List all remote sources",
                "",
                colors.bold("\tTrace Commands:"),
                "\t\\tf " + colors.grey("{OPTIONAL_LIMIT}") + "\t\t\t - Show recent trace files",
                "\t\\tfc {HOST} {FILENAME} " + colors.grey("{OPTIONAL_LIMIT}") + "\t - Show recent updates in a trace file",
                "",
                colors.bold("\tAdministraion Commands:"),
                "\t\\passwd " + colors.grey("{OPTIONAL_USER}") + "\t - Set a password for a user, by default the current user.",
                "\t\\roles " + colors.grey("{OPTIONAL_USER}") + "\t - Show the active permissions assigned to a user",
                "",
                colors.bold("\tHelper Commands:"),
                "\t\\history " + colors.grey("{OPTIONAL_LIMIT}") + "\t\t - Show censql command history",
                "\t\\tp {SCHEMA.TABLE}" + colors.grey(" {OPTIONAL_LIMIT}") + "\t - Preview a table",
                "\t\\head {SCHEMA.TABLE} {ORDER_COLUMN} " + colors.grey("{OPTIONAL_LIMIT}") + "\t- View the first N tows of a table ordered by a column",
                "\t\\tail {SCHEMA.TABLE} {ORDER_COLUMN} " + colors.grey("{OPTIONAL_LIMIT}") + "\t- View the last N tows of a table ordered by a column",
                "\t\\watch " + colors.grey("-i {DELAY_IN_SECONDS}") + " {COMMAND}\t\t\t- Run a command over and over again with a delay",
                "\t\\time " + "{COMMAND}\t\t\t\t\t\t- Run a command and return the time taken with the results",
                "",
                colors.bold("\tSettings:") + colors.grey(" Internal commands for censql settings and config"),
                "\t\\sgh\t\t\t\t\t - Set the height to draw graphs",
                "\t\\sbh\t\t\t\t\t - Set the height to draw bar charts",
                "\t\\save {ALIAS}\t\t\t\t - Save current connection to use later with --use command",
                "",
                colors.bold("Post Commands:") + colors.grey(" Chained onto the end of a query, for example: '\\st\\g | grep HOST: | cut 8-'"),
                "\tgrep [-i] {FILTER_STRING/REGEX_STRING}\t- filter the results and only show the ones that match",
                "\thead {AMOUNT_OF_LINES}" + "\t\t\t- Only show the amount of line from the top of the output",
                "\ttail {AMOUNT_OF_LINES}" + "\t\t\t- Only show the amount of line from the bottom of the output",
                "\twc " + "\t\t\t\t\t- Count the amount of lines for this output",
                "\ttac " + "\t\t\t\t\t- Reverse output vertically",
                "\trev " + "\t\t\t\t\t- Reverse output horizontally",
                "\twrite {FILE_LOCATION}" + "\t\t\t- Write output to file",
                "\tcut {AMOUNT_OF_CHARS}" + "\t\t\t- Cut off characters from one side of the output",
                colors.grey("\t\t\t\t\t\t  eg: 'cut 3-' would cut the first 2 characters off each line"),
                colors.grey("\t\t\t\t\t\t  and 'cut -3' would cut all characters after the first 3"),
                "",
                colors.bold("Formatting:") + colors.grey(" Added onto the end of a query, for example: '\\st\\g'"),
                "\t\\g\t\t- Group output into each piece of data to it's own row",
                "\t\\j\t\t- Display the data in JSON",
                "\t\\jj\t\t- Display the data in pretty JSON",
                "\t\\csv | \\c\t- Display the data in a csv format",
                "",
                (new Array(global.censql.graphWidth + 1).join("-")).dim,
                "Settings (Such as graph height) are saved to file in the current user's home folder in '.censql' not in HANA.".dim,
                "Bug Reports: https://github.com/Centiq/CenSQL/issues".dim
            ].join("\n"),
            "message"
        ]);
}

module.exports = HelpCommandHandler;
