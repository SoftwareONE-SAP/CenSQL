#!/usr/local/bin/node

var debug = require("debug")("censql:main");
var ScreenManager = require("./util/ScreenManager.js");
var CommandHandler = require("./util/CommandHandler.js");
var HDB = require("./lib/HdbHandler.js");
var argv = require('optimist').argv;

var CenSql = function(){

	/**
	 * Make sure we have the arguments needed to connect to HANA
	 */
	if(!argv.host || !argv.user || !argv.pass || !argv.port || argv.help){
		console.log([
			"Usage:\t censql --user <USER> --port 3<ID>15 --host <IP OR HOSTNAME> --pass <PASSWORD>",
			"\t censql --user <USER> --port 3<ID>15 --host <IP OR HOSTNAME> --pass <PASSWORD> --command '<SQL_STRING>'",
			"Example: censql --user SYSTEM --port 30015 --host 192.168.0.1 --pass Password123",
			"Example: censql --user SYSTEM --port 30015 --host 192.168.0.1 --pass Password123 --command 'SELECT * FROM SYS.M_SERVICES'",
			"",
			"CenSQL Help",
			"--user\t\tThe username for the user to connect as",
			"--pass\t\tThe password for the user connecting with",
			"--host\t\tThe host to connect to",
			"--port\t\tThe port to connect to the host with (Layout: '3<ID>15', Instance 99 would be 39915)",
			"--command\tOptionally run a command/sql without entering the interective terminal",
			"",
			"--nocolour\tdisable colour output",
			"--nocolor\talias of --no-colour",
		].join("\n"));
		return;
	}

	/**
	 * Create screen object adn give it the command handler to handle user input
	 */
	this.screen = new ScreenManager(
		// Command if given
		argv.command, 

		// Settings
		{
			plotHeight: 10,
			colour: argv['nocolour'] || argv['nocolor'] ? false : true
		},

		// Command Handler
		{
			handleCommand: function(command, callback){
				return this.commandHandler.onCommand(command, callback);
			}.bind(this)
		}
	);

	this.hdb = new HDB();

	/**
	 * Connect to HANA with the login info supplied by the user
	 */
	this.hdb.connect(argv.host, argv.user, argv.pass, argv.port, "conn", function(err, data){

		/**
		 * If the user specified the command, we do not want to open an interactive session
		 */
		if(!argv.command){
	        this.screen.ready();
		}

		/**
		 * Create a new command handler
		 */
        this.commandHandler = new CommandHandler(this.screen, this.hdb, argv.command);

    }.bind(this))

}

new CenSql();