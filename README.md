
<h1>CenSQL</h1>

<img src="http://i.imgur.com/pEkKthe.gif"></img>

<h5>A better CLI client for SAP HANA</h5>

<p>
CenSQL (Pronounced "<i>Sen-Sea-Quel</i>") is an unofficial replacement by Centiq Ltd for the hdbsql CLI. It was created to provided command history and shorthand commands useful for monitoring SAP HANA which aren't available in the hdbsql client.
</p>

<p>
As well as having a smoother user interface, CenSQL also provides a lot more functionality which is not present in hdbsql, such as shortcuts for sql queries useful for any DB admin or developer for example <code>\al</code> for viewing open alerts on the instance you are connected to.
</p>

<p>
Finally, CenSQL has support for bar charts and line graphs inside the CLI interface for showing a 'at-a-glanse' view of the status and history of the instance, for example <code>\cpu</code> for showing the CPU usage for each host for the instance and <code>\smem</code> for showing the current shared memory.
</p>

<h3>Installation</h3>
<p>Note: CenSQL has only been tested on Ubuntu 14.04 And Debian 8 (jessie). However it should work on any distro running NodeJS v0.10.30 or higher<p>
<ol>
  <li>Install NodeJS v0.10.30 or higher (If not already installed)</li>
  <li><code>cd /opt</code></li>
  <li><code>git clone git@github.com:Centiq/CenSQL.git</code></li>
  <li><code>cd CenSQL</code></li>
  <li><code>./install.sh</code></li>
</ol>

<h3>Program Usage</h3>
<pre>
Usage:	 censql --user {USER} --port 3<ID>15 --host {IP OR HOSTNAME} --pass <PASSWORD>
	     censql --user {USER} --port 3<ID>15 --host {IP OR HOSTNAME} --pass <PASSWORD> --command '{SQL_STRING}'
Example: censql --user SYSTEM --port 30015 --host 192.168.0.1 --pass Password123
Example: censql --user SYSTEM --port 30015 --host 192.168.0.1 --pass Password123 --command 'SELECT * FROM SYS.M_SERVICES'

CenSQL Help
--user		The username for the user to connect as
--pass		The password for the user connecting with
--host		The host to connect to
--port		The port to connect to the host with (Layout: '3<ID>15', Instance 99 would be 39915)
--command	Optionally run a command/sql without entering the interective terminal

--nocolour	disable colour output
--nocolor	alias of --no-colour
</pre>

<h3>Command Usage</h3>

<h4>Basic SQL</h4>
<p>Entering a SQL query is done by simply typing it in and pressing enter.</p>

<pre>
> SELECT HOST, UNLOAD_TIME, SCHEMA_NAME FROM SYS.M_CS_UNLOADS LIMIT 4

HOST | UNLOAD_TIME | SCHEMA_NAME
- - - - - - - - - - - - - - - - - - - 
hananode01 | 2015-07-02T05:30:34.017 | _SYS_STATISTICS
hananode01 | 2015-07-02T05:30:34.006 | _SYS_STATISTICS
</pre>

<p>Results will be returned in a table format unless the command is ended with '\G' in which case it will draw data in a grouped format<p>

<pre>
> SELECT HOST, UNLOAD_TIME, SCHEMA_NAME FROM SYS.M_CS_UNLOADS LIMIT 4\G

No: 0 -------------------
 HOST: hananode01
 UNLOAD_TIME: 2015-07-02T05:30:34.017
 SCHEMA_NAME: _SYS_STATISTICS
No: 1 -------------------
 HOST: hananode01
 UNLOAD_TIME: 2015-07-02T05:30:34.006
 SCHEMA_NAME: _SYS_STATISTICS
</pre>

<h4>CenSQL Commands</h4>
<p>Any CenSQL command is prefixed with a '\'. This stops the input from being sent directly to HANA and instead runs the CenSQL command.</p>

<pre>
> \st

HOST | HOST_ACTIVE | HOST_STATUS
- - - - - - - - - - - - - - - - - - - 
hananode01 | YES | OK
</pre>

<h4>Post Commands</h4>
<p>Output from any query or command may be piped to a post command which will transform the output in some way. eg:</p>
<pre>
> \serv | grep indexserver

hananode01 | 30103 | indexserver | 4771 | master | YES | 30115 | MASTER
</pre>

<h4>Help Command</h4>
<pre>
> \help

CenSQL v1.0.0 Help
-----------------------------------------------------
Commands:
	Basic:
	\h			- For Help
	\sc, \ds		- To list schemas
	\us, \du		- To list users
	\ta, \dt {SCHEMA_NAME}	- To list tables for a schema
	\vs, \dv {SCHEMA_NAME}	- To list views for a schema
	\in			- To list instances
	
	History:
	\ul {OPTIONAL_LIMIT}	- To list recent unloads
	\mem			- Graph physical memory over the last 3 days
	\imem			- Graph instance used memory over the last 3 days
	\cpu			- Graph cpu over the last 3 days
	\swap			- Graph swap over the last 3 days
	\row			- Graph the used fixed part size for row storage over the last 3 days
	\csd			- Graph CS in memory delta over the last 3 days
	\csr			- Graph CS read count over the last 3 days
	\csw			- Graph CS write count over the last 3 days
	\csc			- Graph CS record count over the last 3 days
	\csm			- Graph CS in memory size total (incl delta) over the last 3 days
	
	Current Status:
	\al			- To list active alerts
	\st			- To list hosts for instance
	\con			- To list connections
	\serv			- To list services
	\tt {OPTIONAL_LIMIT}	- To list the largest column tables
	\ba {OPTIONAL_LIMIT}	- To list recent backups
	\smem			- Show bar chart of shared memeory
	\hmem			- Show bar chart of heap memory usage per service
	\tmem			- Show bar chart of total memory usage per service
	\scpu			- Show bar chart of cpu usage per service

	Settings:
	\sgh			- Set the height to draw graphs

Post Commands:
	grep [-i] {FILTER_STRING/REGEX_STRING}	- filter the results and only show the ones that match
	head {AMOUNT_OF_LINES}		- Only show the amount of line from the top of the output
	tail {AMOUNT_OF_LINES}		- Only show the amount of line from the bottom of the output
	cut {AMOUNT_AND_DIR}		- Cut off characters from one side of the file.
					eg: 'cut 3-' would cut the first 2 characters off each line
</pre>

<hr>
License: <a href="https://github.com/Centiq/CenSQL/blob/master/license.md">MIT</a>
