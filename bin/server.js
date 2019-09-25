/**
 * Copyright 2019 Arcus Project
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const fs = require('fs');
const https = require('https');
const exec = require("child_process").exec;
const express = require('express');
const nconf = require('nconf');
const compression = require('compression');
const fallback = require('express-history-api-fallback');
const serveStatic = require('serve-static');
const vhost = require('vhost');

// Load environment-specific config from command line, env and config/*.json files
nconf.argv().env();
nconf.file({ file: `./config/${nconf.get('NODE_ENV') || 'development'}.json` });
nconf.defaults({
  "host": "localdev.irisbylowes.com",
  "port": 8443,
  "staticPath": "./",
  "liveReload": false,
});

const ROOT = process.cwd();
// Create app that will serve the DoneJS application
const staticApp = express();

staticApp
  .use(compression())
  .use('/', serveStatic(nconf.get('staticPath'), {
    index: nconf.get('indexFile')
  }));

// Enable push state routing
staticApp.use(fallback(path.join(ROOT, nconf.get('staticPath'), nconf.get('indexFile'))));

// Enable steal-tools live-relaod in development
if(nconf.get('liveReload')) {
  var stealToolsPath = path.join("node_modules", ".bin", "steal-tools");
		if(!fs.existsSync(stealToolsPath)) {
			console.error('live-reload not available: ' +
				'No local steal-tools binary found. ' +
				'Run `npm install steal-tools --save-dev`.');
		} else {
			var cmd = `${stealToolsPath} live-reload --ssl-cert=${ROOT}/config/ssl/server.crt --ssl-key=${ROOT}/config/ssl/server.key`;

			var child = exec(cmd, {
				cwd: process.cwd()
			});

			child.stdout.pipe(process.stdout);
			child.stderr.pipe(process.stderr);

			var killOnExit = require('infanticide');
			killOnExit(child);
		}
}

// Create main app
const app = express();
const port = nconf.get('port');
const host = nconf.get('host');

// Add vhost routing to static app
app.use(vhost(host, staticApp));

// copy your server config over
if (nconf.get('NODE_ENV') === 'production') {
  const configDestDir = `${ROOT}/build/dist/config`;
  if (!fs.existsSync(configDestDir)) {
    fs.mkdirSync(configDestDir, {'recursive': true});
  }
  fs.writeFileSync(`${configDestDir}/server.json`, fs.readFileSync(`${ROOT}/config/server.json`));
}

const server = https.createServer({
    requestCert: true,
    rejectUnauthorized: false,
    key: fs.readFileSync( './bin/localhost.key' ),
    cert: fs.readFileSync( './bin/localhost.cert' ),
}, app).listen(port);

server.on('error', (e) => {
	if(e.code === 'EADDRINUSE') {
		console.error(`ERROR: Can not start i2web on port ${port}.\nAnother application is already using it.`);
	} else {
		console.error(e);
		console.error(e.stack);
	}
});

server.on('listening', () =>
  console.log(`i2web application started on ${host}:${port}`)
);
