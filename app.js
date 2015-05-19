#!/usr/local/bin/node

var debug = require("debug")("censql:main");
var ScreenManager = require("./util/ScreenManager.js");
var CommandHandler = require("./util/CommandHandler.js");
var HDB = require("./lib/HdbHandler.js");
var argv = require('optimist').argv;

var CenSql = function(){

	this.screen = new ScreenManager({
		handleCommand: function(command, callback){
			return this.commandHandler.onCommand(command, callback);
		}.bind(this)
	});

	this.hdb = new HDB();

	this.hdb.connect(argv.host, argv.user, argv.pass, argv.port, "conn", function(err, data){
        this.screen.ready();

        setTimeout(function(){
			this.commandHandler = new CommandHandler(this.screen, this.hdb);
        }.bind(this), 1);

    }.bind(this))

}

new CenSql();