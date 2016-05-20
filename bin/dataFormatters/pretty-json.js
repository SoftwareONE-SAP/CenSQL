
module.exports = function(command, data){
	return JSON.stringify(data, null, 2).split("\n");
}