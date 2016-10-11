var isValidPath = require('is-valid-path');
var path = require("path");
var fs = require("fs");
var colors = require("colors");

module.exports = function(linesIn, command) {

	var parts = command.trim().split(" ");

	if(parts.length < 2){
		parts[1] = "";
	}

    var fileLoc = parts[1];

    if(fileLoc.length == 0){
    	return ["No file path supplied!".bold + " Example: '" + "SELECT 'HELLO', 'WORLD' FROM DUMMY | write myfile.txt".dim + "'"]
    }

 	if(!isValidPath(fileLoc)){
 		return ["Invalid file path! " + fileLoc.red.bold];
 	}

 	var dirLoc = path.dirname(fileLoc);

 	try{
 		fs.lstatSync(dirLoc).isDirectory()
 	}catch(e){
 		if(e.code == "ENOENT"){
 			return [("Location: '" + dirLoc + "' does not exist!").red.bold]
 		}
 	}

 	try{
 		if(!fs.lstatSync(fileLoc).isFile()){
 			return [("'" + fileLoc + "' is a directory!").red.bold];
 		}
 	}catch(e){
 		if(e.code != "ENOENT"){
 			return [e.message.red.bold];
 		}
 	}

 	var output = linesIn.join("\n");

 	fs.writeFileSync(fileLoc, output)

    return [("File saved to: ".bold + fileLoc).green];
}
