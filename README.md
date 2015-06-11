
<h1>CenSQL</h1>

<h5>A better CLI client for SAP HANA</h5>

<h3>Installation</h3>
<ol>
  
  <li>Install NodeJS v0.10.30 or higher (If not already installed)</li>
  <li>git clone ...</li>
  <li>cd CenSQL</li>
  <li>
    Use application like so: <code>./app.js --user USERNAME --port PORT --host HOSTNAME/IP --pass PASSWORD</code>
    <br>
    Example: <code>./app.js --user SYSTEM --port 30015 --host 127.0.0.1 --pass myPassword123</code>
  </li>

</ol>

<h3>Example Output</h3>

<h5>Basic usage</h5>
```
  > SELECT HOST, SCHEMA_NAME, TABLE_NAME FROM SYS.M_CS_TABLES LIMIT 5
  
  HOST | SCHEMA_NAME | TABLE_NAME
  - - - - - - - - - - - - - - - - - - - 
  dev-kvmhana02 | TEST_ANARCHY_CY9G0LARHREUBVP3 | ANARCHY_00JK8DDLG0O6FVW9
  dev-kvmhana02 | TEST_ANARCHY_OP9YD6WOUVA51E8G | ANARCHY_00QN9YP6YAPC96UQ
  dev-kvmhana02 | TEST_ANARCHY_3MCFVHKI7YUY2UTM | ANARCHY_01E8S0122P2J1SU9
  dev-kvmhana02 | TEST_ANARCHY_V8TO8EPG82NHW6BT | ANARCHY_01NL71XYJAK295UB
  dev-kvmhana02 | TEST_ANARCHY_6FWJAKF2EGYBKGA2 | ANARCHY_038VUW1QBSPDBPSV
```
<h5>Group Formatting</h5>
```
> SELECT HOST, SCHEMA_NAME, TABLE_NAME FROM SYS.M_CS_TABLES LIMIT 5\G

No: 0 -------------------
 HOST: dev-kvmhana02
 SCHEMA_NAME: TEST_ANARCHY_CY9G0LARHREUBVP3
 TABLE_NAME: ANARCHY_00JK8DDLG0O6FVW9
No: 1 -------------------
 HOST: dev-kvmhana02
 SCHEMA_NAME: TEST_ANARCHY_OP9YD6WOUVA51E8G
 TABLE_NAME: ANARCHY_00QN9YP6YAPC96UQ
No: 2 -------------------
 HOST: dev-kvmhana02
 SCHEMA_NAME: TEST_ANARCHY_3MCFVHKI7YUY2UTM
 TABLE_NAME: ANARCHY_01E8S0122P2J1SU9
No: 3 -------------------
 HOST: dev-kvmhana02
 SCHEMA_NAME: TEST_ANARCHY_V8TO8EPG82NHW6BT
 TABLE_NAME: ANARCHY_01NL71XYJAK295UB
No: 4 -------------------
 HOST: dev-kvmhana02
 SCHEMA_NAME: TEST_ANARCHY_6FWJAKF2EGYBKGA2
 TABLE_NAME: ANARCHY_038VUW1QBSPDBPSV
```
<h5>Help Section</h5>
```
> \h

CenSQL v1.0.0 Help
-----------------------------------------------------
Basic:
\h			- For Help
\sc			- To list schemas
\st			- To list hosts for instance
\ta {SCHEMA_NAME}	- To list tables for a schema
\vs {SCHEMA_NAME}	- To list views for a schema
\in			- To list instances

History:
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
\con			- To list connections
\serv			- To list services
\tt {OPTIONAL_LIMIT}	- To list the largest column tables
\ba {OPTIONAL_LIMIT}	- To list recent backups
\smem			- Show bar chart of shared memeory
\hmem			- Show bar chart of heap memory usage per service
\tmem			- Show bar chart of total memory usage per service
\scpu			- Show bar chart of cpu usage per service

Settings:
\sgh			-Set the height to draw graphs
```
<h4>View Status</h4>
<h5>View host status:</h5>
```
> \st

HOST | HOST_ACTIVE | HOST_STATUS
- - - - - - - - - - - - - - - - - - - 
dev-kvmhana01 | YES | OK
dev-kvmhana02 | YES | OK
dev-kvmhana03 | YES | IGNORE
```
<h5>View open alerts</h5>
```
> \al

ALERT_TIMESTAMP | ALERT_RATING | ALERT_NAME | ALERT_DETAILS | INDEX
- - - - - - - - - - - - - - - - - - - 
2015-06-11T11:31:20.528 | 1 | Notification of high priority alerts | 6 high priority alerts occurred. | 
2015-06-11T11:31:49.366 | 2 | Granting of SAP_INTERNAL_HANA_SUPPORT role | The SAP_INTERNAL_HANA_SUPPORT is currently granted to 1 user(s) | 
2015-06-11T11:31:50.034 | 4 | Discrepancy between host server times | There is a discrepancy of 360 minutes between the server time on host dev-kvmhana01 and the server time on dev-kvmhana02. | dev-kvmhana01.dev-kvmhana02
2015-06-11T11:31:50.458 | 3 | Database disk usage | The disk usage of this database has exceeded 444 GB. See system view M_DISK_USAGE for more details. | disk usage
2015-06-11T09:54:27.335 | 1 | Notification of medium and high priority alerts | 1170 medium or high priority alerts occurred. | 
2015-06-11T09:51:26.291 | 1 | Notification of all alerts | 2494 alerts occurred. | 
2015-06-11T09:51:29.408 | 3 | Age of most recent data backup | The last data backup is 7 days old. This will increase downtime in a recovery situation. | 7
```
<h5>View backups</h5>
```
BACKUP_ID | UTC_START_TIME | STATE_NAME
- - - - - - - - - - - - - - - - - - - 
1433428507690 | 2015-06-04T14:35:07.69 | successful
1433154249270 | 2015-06-01T10:24:09.27 | successful
1433154201337 | 2015-06-01T10:23:21.337 | successful
1433154153604 | 2015-06-01T10:22:33.604 | successful
1433154104709 | 2015-06-01T10:21:44.709 | successful
1433154054557 | 2015-06-01T10:20:54.557 | successful
1433154003687 | 2015-06-01T10:20:03.687 | successful
1433153673372 | 2015-06-01T10:14:33.372 | successful
1433153568696 | 2015-06-01T10:12:48.696 | successful
1433152538602 | 2015-06-01T09:55:38.602 | successful
```
<h5>Show shared memory</h5>
```
Shared Memory Usage - dev-kvmhana01 - 30003
█████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Shared Memory Usage - dev-kvmhana01 - 30007
█████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Shared Memory Usage - dev-kvmhana02 - 30003
████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

- SHARED_MEMORY_USED_SIZE
- SHARED_MEMORY_FREE_SIZE
```
<h5>Show CPU usage per service</h5>
```
\scpu

CPU Usage - dev-kvmhana01 - nameserver
█████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana01 - preprocessor
█████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana01 - indexserver
█████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana01 - webdispatcher
█████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana01 - xsengine
█████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana01 - compileserver
█████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana02 - nameserver
█████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana02 - preprocessor
█████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana02 - indexserver
█████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana02 - compileserver
█████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana03 - nameserver
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana03 - preprocessor
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana03 - indexserver
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

CPU Usage - dev-kvmhana03 - compileserver
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

- WORKING
- IDLE
```
<h4>Show History</h4>
<h5>Show Memory Usage For Column Storage</h5>
```
 \csm

╔186598683064═══════════════════════════════════════════════════════════╗
║····································································■··║
║···································································■···║
║·································································■■····║
║·······························································■■······║
║·····························································■■········║
║····························································■··········║
║·······································································║
║·······················································■■■·■···········║
║····················································■■■···■············║
║··················································■■··················■║
║■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■···················■·║
╚4812637580═════════════════════════════════════════════════════════════╝
             CS memory total over the last 3 days - Instance
```
<h5>Show CPU usage per host</h5>
```
╔8575800═════════════════════════════════════════════════════════════════╗
║································································■·······║
║■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■·■■■■■■■║
║········································································║
║········································································║
║········································································║
║········································································║
║········································································║
║········································································║
║········································································║
║········································································║
║········································································║
╚-449931170══════════════════════════════════════════════════════════════╝
              CPU usage over the last 3 days - dev-kvmhana01

╔8575800═════════════════════════════════════════════════════════════════╗
║········································································║
║■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■║
║········································································║
║········································································║
║········································································║
║········································································║
║········································································║
║········································································║
║········································································║
║········································································║
║········································································║
╚-449931170══════════════════════════════════════════════════════════════╝
              CPU usage over the last 3 days - dev-kvmhana02
```
<h5>Show CS delta memory</h5>
```
 \csd

╔18741960060════════════════════════════════════════════════════════════╗
║··························································■············║
║·······································································║
║·······································································║
║··················································■··················■·║
║····················································■··················║
║·······························································■···■■··║
║····························································■··········║
║·································································■·····║
║···············································■··············■········║
║································································■·■····║
║■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■·■■·■·■■■■■·■·■········■║
╚293052172══════════════════════════════════════════════════════════════╝
           CS in memory delta over the last 3 days - Instance
```
