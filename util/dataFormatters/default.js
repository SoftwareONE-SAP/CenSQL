
module.exports = function(command, data, title, settings){
	
	var formatterIndex = command.lastIndexOf("\\");
	var formatterTag = "table";

	if(formatterIndex !== -1){
		formatterTag = command.slice(formatterIndex).substring(1);
	}

	switch(formatterTag.toLowerCase().split(" ")[0]){
		case "g":
		case "group":
			return require("./group.js")(command, data);
			break;

		case "j":
		case "json":
			return require("./json.js")(command, data);
			break;

		case "jj":
		case "pretty-json":
			return require("./pretty-json.js")(command, data);
			break;

		case "c":
		case "csv":
			return require("./csv.js")(command, data, title, settings);
			break;

		case "m":
		case "message":
			return require("./message.js")(command, data);
			break;

		case "lg":
		case "line-graph":
			return require("./line-graph.js")(command, data, title, settings);
			break;

		case "bc":
		case "bar-chart":
			return require("./bar-chart.js")(command, data, title, settings);
			break;

		case "kvbc":
		case "key-value-bar-chart":
			return require("./key-value-bar-chart.js")(command, data, title, settings);
			break;

		default:
			return require("./table.js")(command, data);
			break;
	}

}