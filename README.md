
# CenSQL

<img src="http://i.imgur.com/ueZN0t8.gif"></img>

##### A better CLI client for SAP HANA

CenSQL (Pronounced "<i>Sen-Sea-Quel</i>") is an unofficial replacement by Centiq Ltd for the hdbsql CLI. It was created to provided command history and shorthand commands useful for monitoring SAP HANA which aren't available in the hdbsql client.

As well as having a smoother user interface, CenSQL also provides a lot more functionality which is not present in hdbsql, such as shortcuts for sql queries useful for any DB admin or developer for example <code>\al</code> for viewing open alerts on the instance you are connected to.

Finally, CenSQL has support for bar charts and line graphs inside the CLI interface for showing a 'at-a-glance' view of the status and history of the instance, for example <code>\cpu</code> for showing the CPU usage for each host for the instance and <code>\smem</code> for showing the current shared memory.


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
Any CenSQL command is prefixed with a '\\'. This stops the input from being sent directly to HANA and instead runs the CenSQL command.

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

#### Non Interactive (Batch mode)
```
$ censql --user SYSTEM --port 34315 --host 192.168.182.240 --pass Passw0rd --command "\st"
HOST | HOST_ACTIVE | HOST_STATUS
- - - - - - - - - - - - - - - - - - - 
dev-kvmhana01 | YES | OK
dev-kvmhana02 | YES | OK

$ censql --use MY_SAVED_INSTANCE --command "\st\j"
[{"HOST":"dev-hana01","HOST_ACTIVE":"YES","HOST_STATUS":"OK"},{"HOST":"dev-hana02","HOST_ACTIVE":"YES","HOST_STATUS":"OK"}]
```

License: <a href="https://github.com/Centiq/CenSQL/blob/master/license.md">MIT</a>
