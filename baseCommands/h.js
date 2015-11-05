var path = require("path");
var colors = require("colors");

var HelpCommandHandler = function() {
    this.description = "";
}

HelpCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

    callback(
        [
            0, [
                colors.bold(colors.green("CenSQL") + " v" + require(path.join(path.dirname(require.main.filename), 'package.json')).version + " Help"),
                "-----------------------------------------------------",
                colors.bold("Commands:"),
                colors.bold("\tBasic:"),
                "\t\\h\t\t\t\t\t- For Help",
                "\t\\sc, \\ds\t\t\t\t- To list schemas",
                "\t\\us, \\du\t\t\t\t- To list users",
                "\t\\ta, \\dt " + colors.grey("{SCHEMA_NAME}") + "\t\t\t- To list tables for a schema",
                "\t\\vs, \\dv " + colors.grey("{SCHEMA_NAME}") + "\t\t\t- To list views for a schema",
                "\t\\in\t\t\t\t\t- To list instances",
                "\t\\ping [-f | --forever] " + colors.grey("{OPTIONAL_SLEEP}") + "\t- Test how long it takes to connect to HANA.",
                "\t",
                colors.bold("\tHistory:"),
                "\t\\ul " + colors.grey("{OPTIONAL_LIMIT}") + "\t- To list recent unloads",
                "\t\\mem\t\t\t- Graph physical memory over the last 3 days",
                "\t\\imem\t\t\t- Graph instance used memory over the last 3 days",
                "\t\\cpu\t\t\t- Graph cpu over the last 3 days",
                "\t\\swap\t\t\t- Graph swap over the last 3 days",
                "\t\\row\t\t\t- Graph the used fixed part size for row storage over the last 3 days",
                "\t\\csd\t\t\t- Graph CS in memory delta over the last 3 days",
                "\t\\csr\t\t\t- Graph CS read count over the last 3 days",
                "\t\\csw\t\t\t- Graph CS write count over the last 3 days",
                "\t\\csc\t\t\t- Graph CS record count over the last 3 days",
                "\t\\csm\t\t\t- Graph CS in memory size total (incl delta) over the last 3 days",
                "\t",
                colors.bold("\tCurrent Status:"),
                "\t\\al\t\t\t- To list active alerts",
                "\t\\st\t\t\t- To list hosts for instance",
                "\t\\con\t\t\t- To list connections",
                "\t\\serv\t\t\t- To list services",
                "\t\\tt " + colors.grey("{OPTIONAL_LIMIT}") + "\t- To list the largest column tables",
                "\t\\ba " + colors.grey("{OPTIONAL_LIMIT}") + "\t- To list recent backups",
                "\t\\smem\t\t\t- Show bar chart of shared memeory",
                "\t\\hmem\t\t\t- Show bar chart of heap memory usage per service",
                "\t\\tmem\t\t\t- Show bar chart of total memory usage per service",
                "\t\\scpu\t\t\t- Show bar chart of cpu usage per service",
                "\t\\rep\t\t\t- Show current replication status",
                "\t\\stor\t\t\t- Show the current storage usage",
                "\t\\disk\t\t\t- Show info about the disks",
                "",
                colors.bold("\tHelper Commands:"),
                "\t\\sgh\t\t\t\t\t - Set the height to draw graphs",
                "\t\\sbh\t\t\t\t\t - Set the height to draw bar charts",
                "\t\\watch -i {DELAY_IN_SECONDS} {COMMAND}\t - Run a command over and over again with a delay",
                "",
                colors.bold("Post Commands:") + colors.grey(" Chained onto the end of a query, for example: '\\st\\g | grep HOST'"),
                "\tgrep [-i] {FILTER_STRING/REGEX_STRING}\t- filter the results and only show the ones that match",
                "\thead " + colors.grey("{AMOUNT_OF_LINES}") + "\t\t\t- Only show the amount of line from the top of the output",
                "\ttail " + colors.grey("{AMOUNT_OF_LINES}") + "\t\t\t- Only show the amount of line from the bottom of the output",
                "\twc " + "\t\t\t\t\t- Count the amount of lines for this output",
                "\tcut " + colors.grey("{AMOUNT_OF_CHARS}") + "\t\t\t- Cut off characters from one side of the output",
                colors.grey("\t\t\t\t\t\t  eg: 'cut 3-' would cut the first 2 characters off each line"),
                colors.grey("\t\t\t\t\t\t  and 'cut -3' would cut all characters after the first 3"),
                "",
                colors.bold("Formatting:") + colors.grey(" Added onto the end of a query, for example: 'SELECT 1 FROM DUMMY\\g'"),
                "\t\\g - Group output into each piece of data to it's own row",
                "\t\\j - Display the data in JSON",
                "\t\\jj - Display the data in pretty JSON",
                "",
                "Settings (Such as graph height) are saved to file in the current user's home folder in '.censql' not in HANA."
            ].join("\n"),
            "message"
        ]);
}

module.exports = HelpCommandHandler;