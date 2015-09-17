
var HelpCommandHandler = function() {
    this.description = "";
}

HelpCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

    callback(
        [
            0, [
                "CenSQL v1.0.0 Help",
                "-----------------------------------------------------",
                "Commands:",
                "\tBasic:",
                "\t\\h\t\t\t- For Help",
                "\t\\sc, \\ds\t\t- To list schemas",
                "\t\\us, \\du\t\t- To list users",
                "\t\\ta, \\dt {SCHEMA_NAME}\t- To list tables for a schema",
                "\t\\vs, \\dv {SCHEMA_NAME}\t- To list views for a schema",
                "\t\\in\t\t\t- To list instances",
                "\t",
                "\tHistory:",
                "\t\\ul {OPTIONAL_LIMIT}\t- To list recent unloads",
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
                "\tCurrent Status:",
                "\t\\al\t\t\t- To list active alerts",
                "\t\\st\t\t\t- To list hosts for instance",
                "\t\\con\t\t\t- To list connections",
                "\t\\serv\t\t\t- To list services",
                "\t\\tt {OPTIONAL_LIMIT}\t- To list the largest column tables",
                "\t\\ba {OPTIONAL_LIMIT}\t- To list recent backups",
                "\t\\smem\t\t\t- Show bar chart of shared memeory",
                "\t\\hmem\t\t\t- Show bar chart of heap memory usage per service",
                "\t\\tmem\t\t\t- Show bar chart of total memory usage per service",
                "\t\\scpu\t\t\t- Show bar chart of cpu usage per service",
                "\t\\rep\t\t\t- Show current replication status",
                "\t\\stor\t\t\t- Show the current storage usage",
                "\t\\disk\t\t\t- Show info about the disks",
                "",
                "\tSettings:",
                "\t\\sgh\t\t\t- Set the height to draw graphs",
                "",
                "Post Commands:",
                "\tgrep [-i] {FILTER_STRING/REGEX_STRING}\t- filter the results and only show the ones that match",
                "\thead {AMOUNT_OF_LINES}\t\t\t- Only show the amount of line from the top of the output",
                "\ttail {AMOUNT_OF_LINES}\t\t\t- Only show the amount of line from the bottom of the output",
                "\tcut {AMOUNT_AND_DIR}\t\t\t- Cut off characters from one side of the file.",
                "\t\t\t\t\t\teg: 'cut 3-' would cut the first 2 characters off each line"
            ].join("\n"),
            "message"
        ]);
}

module.exports = HelpCommandHandler;