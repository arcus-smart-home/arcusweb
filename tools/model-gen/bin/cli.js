#!/usr/bin/env node

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
const path = require(`path`);
const yargs = require(`yargs`);

const io = require(`../lib/io`);

const ARGV = yargs
	.usage(`$0 <i2common dir> <i2web dir>`)
	.example(`$0 ../i2common ../i2web`)
	.demand(2).argv;

const SRC = path.join(ARGV._[0], `iris2-model/src/main/resources`);
const DEST = path.join(ARGV._[1], `src/models`);

[`capability`, `service`, `type`].map(dir => {
	let source = path.resolve(path.join(SRC, dir));
	let destination = path.resolve(path.join(DEST, dir));
	fs.stat(source, (err, src) => {
		if (!err && src.isDirectory()) {
			fs.stat(destination, (err, dest) => {
				if (!err && dest.isDirectory()) {
					io.readGenerateWrite(source, destination);
				} else {
					console.log(`'${destination}' destination does not exist, skipping '${dir}' generation.`.red);
				}
			});
		} else {
			console.log(`'${destination}' directory does not exist, skipping '${dir}' generation.`.red);
		}
	});
});

