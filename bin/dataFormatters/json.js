
module.exports = function(command, data){

	if(data.length == 0){
		return "[]";
	}

	var keys = Object.keys(data[0]);

	for (var i = 0; i < data.length; i++) {
		for (var k = 0; k < keys.length; k++) {
			if(data[i][keys[k]] instanceof Buffer){
				data[i][keys[k]] = data[i][keys[k]].toString("utf8");
			}
		}
	}
	
	return [JSON.stringify(data)];
}