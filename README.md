
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

<h4>CenSQL Commands</4>
<p>Any CenSQL command is prefixed with a '\'. This stops the input from being sent directly to HANA and instead runs the CenSQL command.</p>

<pre>
> \st

HOST | HOST_ACTIVE | HOST_STATUS
- - - - - - - - - - - - - - - - - - - 
dev-kvmhana03 | YES | OK
</pre>

<hr>
License: <a href="https://github.com/Centiq/CenSQL/blob/master/license.md">MIT</a>
