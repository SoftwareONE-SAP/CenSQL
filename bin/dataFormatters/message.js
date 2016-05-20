
module.exports = function(command, data){
	return (typeof data == "string" ? data.split("\n") : [data]);
}