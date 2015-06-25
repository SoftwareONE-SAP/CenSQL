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
	if(!argv.host || !argv.user || !argv.pass || !argv.port){
		console.log("Usage:\t censql --user <USER> --port 3<ID>15 --host <IP OR HOSTNAME> --pass <PASSWORD>");
		console.log("\t censql --user <USER> --port 3<ID>15 --host <IP OR HOSTNAME> --pass <PASSWORD> --command '<SQL_STRING>'");
		console.log("Example: censql --user SYSTEM --port 30015 --host 192.168.0.1 --pass Password123");
		console.log("Example: censql --user SYSTEM --port 30015 --host 192.168.0.1 --pass Password123 --command 'SELECT * FROM SYS.M_SERVICES'");
		return;
	}

	/**
	 * Create screen object adn give it the command handler to handle user input
	 */
	this.screen = new ScreenManager(argv.command, {
		handleCommand: function(command, callback){
			return this.commandHandler.onCommand(command, callback);
		}.bind(this)
	});

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