var async = require("async");
var colors = require("colors");

var SpecificationsCommandHandler = function() {
	this.includeInAudit = true;
}

SpecificationsCommandHandler.prototype.run = function(command, cParts, conn, screen, callback) {

	async.parallelLimit([
		function(cb) {
			conn.exec("conn", "SELECT PATH, VALUE FROM SYS.M_TOPOLOGY_TREE WHERE NAME = 'os_name' AND PATH LIKE '/host/%/nameserver/%/info'", function(err, data) {

				if (err) {
					cb(err, null);
					return;
				}

				let output = "";

				for (var i = 0; i < data.length; i++) {
					output += data[i].PATH.split("/")[2] + ": " + colors.dim(data[i].VALUE) + "\n"
				}

				cb(null, {
					section: "OS Version",
					data: output
				});

			})
		},
		function(cb) {
			conn.exec("conn", "SELECT PATH, VALUE FROM SYS.M_TOPOLOGY_TREE WHERE NAME = 'cpu_model'", function(err, data) {

				if (err) {
					cb(err, null);
					return;
				}

				let output = "";

				for (var i = 0; i < data.length; i++) {
					output += data[i].PATH.split("/")[2] + ": " + colors.dim(data[i].VALUE) + "\n"
				}

				cb(null, {
					section: "CPUs",
					data: output
				});

			})
		},
		function(cb) {
			conn.exec("conn", "SELECT PATH, VALUE FROM SYS.M_TOPOLOGY_TREE WHERE NAME = 'hw_model'", function(err, data) {

				if (err) {
					cb(err, null);
					return;
				}

				let output = "";

				for (var i = 0; i < data.length; i++) {
					output += data[i].PATH.split("/")[2] + ": " + colors.dim(data[i].VALUE) + "\n"
				}

				cb(null, {
					section: "Hardware Model",
					data: output
				});

			})
		}
	], 10, function(err, data) {

		if (err) {
			callback([1, err, "sql-error"]);
			return;
		}

		let output = "";

		for (var i = 0; i < data.length; i++) {
			output += colors.bold(data[i].section + ":") + "\n";
			output += data[i].data + "\n";
		}

		output = output.substring(0, output.length - 2)

		callback([0, output, "message"]);
	})

}

module.exports = SpecificationsCommandHandler;