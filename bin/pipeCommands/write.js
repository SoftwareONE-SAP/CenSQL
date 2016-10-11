var isValidPath = require('is-valid-path');
var path = require("path");
var fs = require("fs");

module.exports = function(linesIn, command) {

    var fileLoc = command.trim().split(" ")[1];

 	if(!isValidPath(fileLoc)){
 		return ["Invalid path! " + fileLoc];
 	}

 	var dirLoc = path.dirname(fileLoc);

 	try{
 		fs.lstatSync(dirLoc).isDirectory()
 	}catch(e){
 		if(e.code == "ENOENT"){
 			return ["Location: '" + dirLoc + "' does not exist!"]
 		}
 	}

 	try{
 		if(!fs.lstatSync(fileLoc).isFile()){
 			return ["'" + fileLoc + "' is a directory!"];
 		}
 	}catch(e){
 		if(e.code != "ENOENT"){
 			return [e.message.split("\n")];
 		}
 	}

 	var output = linesIn.join("\n");

 	fs.writeFileSync(fileLoc, output)

    return ["File saved to: " + fileLoc];
}
