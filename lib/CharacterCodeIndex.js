/**
 * Required because of nexe bug removing characters
 */
var CharacterCodeIndex = function() {
	this.codes = {
		double_pipe: String.fromCharCode(9553),
		double_pipe_h: String.fromCharCode(9552),
		double_corner_bottom_left: String.fromCharCode(9562),
		double_corner_bottom_right: String.fromCharCode(9565),
		double_corner_top_left: String.fromCharCode(9556),
		double_corner_top_right: String.fromCharCode(9559),

		block_solid: String.fromCharCode(9632),
		block_whole: String.fromCharCode(9608),
		block_faded_min: String.fromCharCode(9617),
		block_faded_mid: String.fromCharCode(9618),
		block_faded_max: String.fromCharCode(9619),

	}

	this.tableChars = {
		'top': String.fromCharCode(9472),
		'top-mid': String.fromCharCode(9516), 
		'top-left': String.fromCharCode(9484), 
		'top-right': String.fromCharCode(9488),
		'bottom': String.fromCharCode(9472), 
		'bottom-mid': String.fromCharCode(9524), 
		'bottom-left': String.fromCharCode(9492),
		'bottom-right': String.fromCharCode(9496),
		'left': String.fromCharCode(9474), 
		'left-mid': String.fromCharCode(9500),
		'mid': String.fromCharCode(9472), 
		'mid-mid': String.fromCharCode(9532),
		'right': String.fromCharCode(9474), 
		'right-mid': String.fromCharCode(9508),
		'middle':String.fromCharCode(9474),
	}
}

module.exports = CharacterCodeIndex;