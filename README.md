
# CenSQL

<img src="http://i.imgur.com/ueZN0t8.gif"></img>

##### A better CLI client for SAP HANA

CenSQL (Pronounced "<i>Sen-Sea-Quel</i>") is an unofficial replacement by Centiq Ltd for the hdbsql CLI. It was created to provided command history and shorthand commands useful for monitoring SAP HANA which aren't available in the hdbsql client.

As well as having a smoother user interface, CenSQL also provides a lot more functionality which is not present in hdbsql, such as shortcuts for sql queries useful for any DB admin or developer for example <code>\al</code> for viewing open alerts on the instance you are connected to.

Finally, CenSQL has support for bar charts and line graphs inside the CLI interface for showing a 'at-a-glanse' view of the status and history of the instance, for example <code>\cpu</code> for showing the CPU usage for each host for the instance and <code>\smem</code> for showing the current shared memory.


<a href="http://scn.sap.com/community/developer-center/hana/blog/2015/09/18/announcing-censql-a-cli-client-for-sap-hana">See an SCN article about CenSQL</a>

### Installation
Note: CenSQL has been tested on Ubuntu, Debian, SLES, SLES4SAP, Windows Server 2003 and Windows 7/8 Desktop. It most likely works perfectly on OSX but no testing is done on this platform.

<ol>
  <li>Install NodeJS <strong>v0.10.30</strong> or higher (If not already installed)</li>
  <li><code>sudo npm install -g censql</code></li>
  <li><code>censql --help</code></li>
</ol>

#### Statically Compile to run without NodeJS (Optional)
<img src="http://i.giphy.com/3o7TKI8PcyvI78VmKI.gif"></img>
<ol>
  <li><code>sudo npm install -g nexe</code></li>
  <li><code>git clone git@github.com:Centiq/CenSQL.git</code></li>
  <li><code>cd CenSQL</code></li>
  <li><code>npm install</code></li>
  <li><code>nexe</code></li>
  <li><code>./censql --help</code> or <code>censql.exe --help</code></li>
</ol>

### Command Usage

#### Basic SQL
Entering a SQL query is done by simply typing it in and pressing enter.

```
> SELECT HOST, UNLOAD_TIME, SCHEMA_NAME FROM SYS.M_CS_UNLOADS LIMIT 2

HOST | UNLOAD_TIME | SCHEMA_NAME
- - - - - - - - - - - - - - - - - - - 
hananode01 | 2015-07-02T05:30:34.017 | _SYS_STATISTICS
hananode01 | 2015-07-02T05:30:34.006 | _SYS_STATISTICS
```

Results will be returned in a table format unless the command is ended with '\G' in which case it will draw data in a grouped format

```
> SELECT HOST, UNLOAD_TIME, SCHEMA_NAME FROM SYS.M_CS_UNLOADS LIMIT 2\G
No: 0 -------------------
 HOST: hananode01
 UNLOAD_TIME: 2015-07-02T05:30:34.017
 SCHEMA_NAME: _SYS_STATISTICS
No: 1 -------------------
 HOST: hananode01
 UNLOAD_TIME: 2015-07-02T05:30:34.006
 SCHEMA_NAME: _SYS_STATISTICS
```

#### CenSQL Commands
Any CenSQL command is prefixed with a '\'. This stops the input from being sent directly to HANA and instead runs the CenSQL command.

```
> \st

HOST | HOST_ACTIVE | HOST_STATUS
- - - - - - - - - - - - - - - - - - - 
hananode01 | YES | OK
```

#### Post Commands
Output from any query or command may be piped to a post command which will transform the output in some way. eg:
```
> \serv | grep indexserver

hananode01 | 30103 | indexserver | 4771 | master | YES | 30115 | MASTER
```

#### Help Command
```
CenSQL Help
-----------------------------------------------------
Commands:
	Basic:
	\h					- For Help
	\sc, \ds				- To list schemas
	\us, \du				- To list users
	\ta, \dt {SCHEMA_NAME}			- To list tables for a schema
	\vs, \dv {SCHEMA_NAME}			- To list views for a schema
	\in					- To list instances
	\ping [-f | --forever] {OPTIONAL_SLEEP}	- Test how long it takes to connect to HANA.
	
	History:
	\ba {OPTIONAL_LIMIT}	- List recent backups
	\ul {OPTIONAL_LIMIT}	- To list recent unloads
	\mem -r (relative)	- Graph physical memory over the last 3 days
	\imem -r (relative)	- Graph instance used memory over the last 3 days
	\cpu -r (relative)	- Graph cpu over the last 3 days
	\swap -r (relative)	- Graph swap over the last 3 days
	\row -r (relative)	- Graph the used fixed part size for row storage over the last 3 days
	\csd -r (relative)	- Graph CS in memory delta over the last 3 days
	\csr -r (relative)	- Graph CS read count over the last 3 days
	\csw -r (relative)	- Graph CS write count over the last 3 days
	\csc -r (relative)	- Graph CS record count over the last 3 days
	\csm -r (relative)	- Graph CS in memory size total (incl delta) over the last 3 days
	
	Current Status:
	\al			- List active alerts
	\st			- List hosts for instance
	\con			- List connections
	\serv			- List services
	\tt {OPTIONAL_LIMIT}	- List the largest column tables
	\smem			- Show bar chart of shared memory (deprecated)
	\hmem			- Show bar chart of heap memory usage per service
	\tmem			- Show bar chart of total memory usage per service
	\scpu			- Show bar chart of cpu usage per service
	\rep			- Show current replication status
	\stor			- Show the current storage usage
	\disk			- List disks by host
	\wl			- Show the current instance workload ('current' being the last time HANA updated this metric)
	\pwl			- Show the peak instance workload
	\vol			- Show the current size and fragmentation of each data volume
	\logs			- List all log files
	\li			- Show the license status and expirary time
	\ips {SCHEMA_NAME} [-f | --forever] {OPTIONAL_SLEEP}	- Show the current inserts per second
	\ag			- List all connected SDI agents
	\ad			- List all registered SDI adapters
	\rs			- List all remote sources

	Trace Commands:
	\tf {OPTIONAL_LIMIT}	 - Show recent trace files
	\tfc {HOST} {FILENAME} {OPTIONAL_LIMIT}	 - Show recent updates in a trace file

	Helper Commands:
	\history {OPTIONAL_LIMIT}		 - Show censql command history
	\tp {SCHEMA.TABLE} {OPTIONAL_LIMIT}	 - Preview a table
	\watch -i {DELAY_IN_SECONDS} {COMMAND}	 - Run a command over and over again with a delay
	\tail {SCHEMA.TABLE} {ORDER_COLUMN} {OPTIONAL_LIMIT} [-f | --forever] {OPTIONAL_SLEEP} - View the last N tows of a table ordered by a column

	Settings: Internal commands for censql settings and config
	\sgh					 - Set the height to draw graphs
	\sbh					 - Set the height to draw bar charts
	\save {ALIAS}				 - Save current connection to use later with --use command

Post Commands: Chained onto the end of a query, for example: '\st\g | grep HOST: | cut 8-'
	grep [-i] {FILTER_STRING/REGEX_STRING}	- filter the results and only show the ones that match
	head {AMOUNT_OF_LINES}			- Only show the amount of line from the top of the output
	tail {AMOUNT_OF_LINES}			- Only show the amount of line from the bottom of the output
	wc 					- Count the amount of lines for this output
	cut {AMOUNT_OF_CHARS}			- Cut off characters from one side of the output
						  eg: 'cut 3-' would cut the first 2 characters off each line
						  and 'cut -3' would cut all characters after the first 3

Formatting: Added onto the end of a query, for example: '\st\g'
	\g		- Group output into each piece of data to it's own row
	\j		- Display the data in JSON
	\jj		- Display the data in pretty JSON
	\csv | \c	- Display the data in pretty JSON

Settings (Such as graph height) are saved to file in the current user's home folder in '.censql' not in HANA.
```

#### Non Interactive
```
$ censql --user SYSTEM --port 34315 --host 192.168.182.240 --pass Passw0rd --command "\st"
HOST | HOST_ACTIVE | HOST_STATUS
- - - - - - - - - - - - - - - - - - - 
dev-kvmhana01 | YES | OK
dev-kvmhana02 | YES | OK

$ censql --user MYUSER --port 30015 --host 192.168.182.5 --pass mypassword --command "\st\j"
[{"HOST":"dev-hana01","HOST_ACTIVE":"YES","HOST_STATUS":"OK"},{"HOST":"dev-hana02","HOST_ACTIVE":"YES","HOST_STATUS":"OK"}]
```

License: <a href="https://github.com/Centiq/CenSQL/blob/master/license.md">MIT</a>
