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

"use strict";

const colors = require(`colors`);
const fs = require(`fs`);
const fse = require(`fs-extra`);
const path = require(`path`);
const Q = require(`q`);
const xml2js = require(`xml2js`);

const normalize = require("../lib/normalize");
const templatize = require("../lib/templatize");

let capNamespaceToFile = [];
let srvNamespaceToFile = [];

function readGenerateWrite(source, destination) {
	fse.emptyDirSync(destination);

	fs.readdir(source, (err, files) => {
		if (err) { throw err; }

		let promises = [];
		let filtered = files.map(file => {
			return path.join(source, file);
		}).filter(file => {
			return fs.statSync(file).isFile();
		});

		for (var i = 0; i < filtered.length; i++) {
			let d = Q.defer();
			Array.prototype.push.call(promises, d.promise);
			try {
				let data = fs.readFileSync(filtered[i], `utf8`);
				generateRaw(data).then(json => {
					d.resolve(writeToDestination(json, path.resolve(destination)));
			  });
			} catch (e) {
				d.reject(e);
				throw e;
			}
		}

		Q.any(promises).then((results) => {
			let parts = source.split(`/`);
			let type = parts[parts.length - 1];
			let dest = path.join(destination,`${type}.js`);
			if (type === `capability`) {
				writeNamespaceTemplate(dest, { mapping: capNamespaceToFile });
			} else if (type === `service`) {
				writeNamespaceTemplate(dest, { mapping: srvNamespaceToFile });
			}
		});
	});
}

function generateRaw(xml) {
	let deferred = Q.defer();
	xml2js.parseString(xml, (err, result) => {
		if (err) { deferred.reject(err); }
		deferred.resolve(result);
	});
	return deferred.promise;
}

function writeToDestination(data, destination) {
	let parts = destination.split(`/`);
	let type = {
		"type": "t:type",
		"capability": "c:capability",
		"service": "s:service"
	}[parts[parts.length - 1]];

	// writeRaw(destination, type, data);
	return writeTemplate(destination, type, data);
}

function writeRaw(dest, type, data) {
	let raw = path.join(dest, `raw`);
	let filename = data[type][`$`][`name`] + `.json`;

	fse.mkdirs(raw, (err) => {
		if (err) { throw err; }
	});
	fs.writeFile(path.join(raw, filename), JSON.stringify(data, null, 2), (err) => {
		if (err) { throw err; }
	});
}

function writeTemplate(dest, type, data) {
	let name = data[type][`$`][`name`]
	try {
		let template = fs.readFileSync(path.join(__dirname, `template.handlebars`), `utf8`);

		let normal = normalize(type, name, data);
		let generated = templatize(normal, template);
		let filename = path.join(dest, name + `.js`);

		let ns = {
			namespace: normal.metadata.namespace,
			filename: `${name}.js`
		}
		if (type === `c:capability`) {
			Array.prototype.push.call(capNamespaceToFile, ns);
		} else if (type === `s:service`) {
			Array.prototype.push.call(srvNamespaceToFile, ns);
		}

		try {
			let filePath = path.join(dest, name + `.js`);
			fs.writeFileSync(filePath, generated);
			console.log(filename.green);
			return filePath;
		} catch (e) { throw e; }
	} catch (e) { throw e; }
}

function writeNamespaceTemplate(dest, data) {
	try {
		let template = fs.readFileSync(path.join(__dirname, `namespace.handlebars`), `utf8`);
		let generated = templatize(data, template);

		fs.writeFileSync(dest, generated);
	} catch (e) { throw e; }
}

module.exports = {
	readGenerateWrite: readGenerateWrite
}