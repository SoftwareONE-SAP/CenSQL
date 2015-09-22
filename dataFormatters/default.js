
module.exports = function(command, data, title, settings){
	
	var formatterIndex = command.lastIndexOf("\\");
	var formatterTag = "table";

	if(formatterIndex > 0){
		formatterTag = command.slice(formatterIndex).substring(1);

		if(formatterTag.length === 0){
			formatterTag = "table";
		}
	}
	
	switch(formatterTag.toLowerCase()){
		case "g":
			return require("./group.js")(command, data);
			break;

		case "j":
			return require("./json.js")(command, data);
			break;

		case "m":
			return require("./message.js")(command, data);
			break;

		case "lg":
			return require("./line-graph.js")(command, data, title, settings);
			break;

		case "bc":
			return require("./bar-chart.js")(command, data, title, settings);
			break;

		case "kbc":
			return require("./key-value-bar-chart.js")(command, data, title, settings);
			break;

		default:
			return require("./table.js")(command, data);
			break;
	}

}