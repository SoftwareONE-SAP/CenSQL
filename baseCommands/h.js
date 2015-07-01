var HelpCommandHandler = function() {
    this.description = "";
    this.helpText = "";
}

HelpCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

    callback(
        [
            0, [
                "CenSQL v1.0.0 Help",
                "-----------------------------------------------------",
                "Basic:",
                "\\h\t\t\t- For Help",
                "\\sc, \\ds\t\t- To list schemas",
                "\\us, \\du\t\t- To list users",
                "\\ta, \\dt {SCHEMA_NAME}\t- To list tables for a schema",
                "\\vs, \\dv {SCHEMA_NAME}\t- To list views for a schema",
                "\\in\t\t\t- To list instances",
                "",
                "History:",
                "\\ul {OPTIONAL_LIMIT}\t- To list recent unloads",
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
                "\\st\t\t\t- To list hosts for instance",
                "\\con\t\t\t- To list connections",
                "\\serv\t\t\t- To list services",
                "\\tt {OPTIONAL_LIMIT}\t- To list the largest column tables",
                "\\ba {OPTIONAL_LIMIT}\t- To list recent backups",
                "\\smem\t\t\t- Show bar chart of shared memeory",
                "\\hmem\t\t\t- Show bar chart of heap memory usage per service",
                "\\tmem\t\t\t- Show bar chart of total memory usage per service",
                "\\scpu\t\t\t- Show bar chart of cpu usage per service",
                "",
                "Settings:",
                "\\sgh\t\t\t-Set the height to draw graphs"
            ].join("\n"),
            "message"
        ]);
}

module.exports = HelpCommandHandler;