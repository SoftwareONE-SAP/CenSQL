var colors = require("colors");

var AreaGraph = function(command, data, title, screen) {
    this.command = command;
    this.data = data;
    this.title = title;
    this.screen = screen;

    this.output = [];
    this.lines = [];

    this.emptyPointChar = "-";
    this.widthRatio = Math.floor((global.censql.graphWidth - 3) / (this.data.length));

    this.chars = [this.screen.cci.codes.block_faded_min.blue, this.screen.cci.codes.block_whole.green, this.screen.cci.codes.block_faded_mid.cyan, this.screen.cci.codes.block_faded_max.red, this.screen.cci.codes.block_faded_max.yellow]

    /**
     * get this.keys
     */
    this.keys = [];

    if (this.data.length > 0) {

        this.keys = Object.keys(this.data[0]);
    } else {
        this.lines.push("No Results!");
        this.lines.push("");
        return this.lines;
    }

    /**
     * Compute
     */
    var max = this.getMaxValue();

    /**
     * Draw
     */
    this.iniGraph();
    this.drawSeries(max);
    this.render();

    return this.lines;
}

AreaGraph.prototype.iniGraph = function() {
    /**
     * Build empty graph
     */
    for (var i = 0; i < this.screen.settings.plotHeight; i++) {
        this.output.push(new Array(this.data.length).join(this.emptyPointChar).split(""));
    }
}

AreaGraph.prototype.render = function() {
    /**
     * write output to this.lines
     */

    this.lines.push(this.title);

    /**
     * Build top of phraph
     */
    this.lines.push((this.screen.cci.codes.double_corner_top_left + (new Array(this.output[0].length * this.widthRatio + 1).join(this.screen.cci.codes.double_pipe_h)) + this.screen.cci.codes.double_corner_top_right).green)

    /**
     * Write data
     */
    for (var i = 0; i < this.output.length; i++) {

        var line = this.screen.cci.codes.double_pipe.green;

        for (var j = 0; j < this.output[i].length; j++) {

            if(this.output[i][j] == this.emptyPointChar){
                this.output[i][j] = this.emptyPointChar.grey;
            }

            for (var k = 0; k < this.widthRatio; k++) {
                line += this.output[i][j];
            }
        }

        line += this.screen.cci.codes.double_pipe.green

        this.lines.push(line);
    }

    /**
     * Build bottom of pgraph
     */
    this.lines.push((this.screen.cci.codes.double_corner_bottom_left + (new Array(this.output[0].length * this.widthRatio + 1).join(this.screen.cci.codes.double_pipe_h)) + this.screen.cci.codes.double_corner_bottom_right).green)

    /**
     * Draw footer
     */

    for (var i = 0; i < this.keys.length; i++) {
        this.lines.push(this.chars[i] + " - " + this.keys[i])
    }
}

AreaGraph.prototype.getMaxValue = function() {
    var max = 0;

    for (var i = 0; i < this.data.length; i++) {

        var sum = 0;

        for (var k = 0; k < this.keys.length; k++) {
            sum += parseInt(this.data[i][this.keys[k]]);
        }

        if (sum > max) {
            max = sum;
        }
    }

    return max;
}

AreaGraph.prototype.drawSeries = function(max) {

    var heightValue = this.screen.settings.plotHeight + 1;

    for (var i = 0; i < this.data.length; i++) {
        for (var k = 0; k < this.keys.length; k++) {
            
            var value = Math.floor(this.data[i][this.keys[k]]);
            var percOfMax = value / max;
            var heightInGraph = Math.floor(heightValue * percOfMax);
            var rowIndex = this.screen.settings.plotHeight;

            while(heightInGraph > 0 && rowIndex > 0){
                rowIndex -= 1;

                if(this.output[rowIndex][i] == this.emptyPointChar){
                    heightInGraph -= 1;

                    this.output[rowIndex][i] = this.chars[k];
                }
            }
        }
    }
}

module.exports = function(command, data, title, screen) {
    return new AreaGraph(command, data, title, screen);
}