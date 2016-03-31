var charm = require('charm')(process.stdout);
var colors = require("colors");
var _ = require('lodash');

var StudioFormatter = function(screen) {
	this.screen = screen;

	this.maxSideWidth = 45;

	this.calculateSize();

	this.refreshCheckDelay = 100;
}

StudioFormatter.prototype.init = function() {
	this.redraw();

	setTimeout(this.checkRefresh.bind(this), this.refreshCheckDelay);
}

StudioFormatter.prototype.calculateSize = function(){
	this.width = process.stdout.columns;
	this.height = process.stdout.rows;
	this.sideWidth = (parseInt(this.width / 4) < this.maxSideWidth ? parseInt(this.width / 4) : this.maxSideWidth);
	this.schemaBoxHeight = parseInt(this.height / 3);
}

StudioFormatter.prototype.checkRefresh = function() {

	if (this.width != process.stdout.columns || this.height != process.stdout.rows) {
		
		/**
		 * Regenerate size
		 */
		this.calculateSize();

		this.redraw();
	}

	setTimeout(this.checkRefresh.bind(this), this.refreshCheckDelay)
}

StudioFormatter.prototype.redraw = function() {
	this.screen.clear();
	this.drawBorder();
}

StudioFormatter.prototype.drawSchemaList = function(list, activeSchema) {

}

StudioFormatter.prototype.drawBorder = function() {

	var borderTheme = "bgWhite"
	var sideBackgroundTheme = "bgBlue";
	var bottomBarTheme = 'bgBlack'

	/**
	 * Draw outer border
	 */
	this.drawBox(1, 1, this.width, 1, " " [borderTheme]);
	this.drawBox(1, this.height, this.width, 1, " " [borderTheme]);

	this.drawBox(1, 2, 1, this.height - 1, " " [borderTheme]);
	this.drawBox(this.width, 2, 1, this.height - 1, " " [borderTheme]);

	/**
	 * Draw sideline
	 */
	this.drawBox(this.sideWidth, 2, 1, this.height - 1, " " [borderTheme]);

	/**
	 * Draw sideBox
	 */
	this.drawBox(2, 2, this.sideWidth - 2, this.height - 1, " " [sideBackgroundTheme]);

	/**
	 * Draw side box divider
	 */
	this.drawBox(2, this.schemaBoxHeight, this.sideWidth - 2, 1, " " [borderTheme]);

	/**
	 * Draw bottom help bar
	 */
	this.drawBox(this.sideWidth + 1, this.height, this.width - this.sideWidth - 1, 2, " " [bottomBarTheme]);
	this.drawText(this.sideWidth + 1, this.height, "Help" ['bgBlack']);

}

StudioFormatter.prototype.drawText = function(x, y, t) {
	this.screen.goto(x, y);
	this.screen.print(t);
	this.screen.goto(0, 0);
}

StudioFormatter.prototype.drawBox = function(x, y, w, h, c) {

	this.screen.goto(x, y);

	for (var dy = 0; dy < h; dy++) {
		for (var dx = 0; dx < w; dx++) {
			this.screen.print(c);
		}
		this.screen.goto(x, y + dy);
	}

	// this.screen.goto(1, 1);
}

StudioFormatter.prototype.byebye = function() {
	this.screen.print("\n");
	this.screen.clear()
	this.screen.print(colors.green("Bye Bye!"), false)
	this.screen.print("\n");
}

module.exports = StudioFormatter;