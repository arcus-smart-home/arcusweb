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

/**
 * Generates coverage reports.
 * Outputs JSON and Clover reports to the file system. Shows the text-based coverage on the command line.
 */
const testee = require('testee');
const puppeteer = require('puppeteer');

// set chromium to node_modules local chromium supplied by puppeteer
process.env.LAUNCHPAD_CHROMIUM = puppeteer.executablePath()

browsers = [{
  "browser": "chrome",
  "args": [
    "--headless",
    "--disable-gpu",
    "--remote-debugging-port=9222"
  ]
}]

const coveragePromise = testee.test('src/test.coverage.html', browsers, {
  coverage: {
    dir: 'src/test/coverage/',
    reporters: ['text', 'html', 'clover'],
    ignore: [
      'node_modules',
      'src/steal',
      'src/test',
      'src/vendor',
    ],
  },
}).catch((e) => {
  console.error(e);
});

module.exports = coveragePromise;
