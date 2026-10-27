const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const isBamboo = process.env.bamboo_buildKey;

let reporter = 'spec';

// set chromium to node_modules local chromium supplied by puppeteer
process.env.LAUNCHPAD_CHROMIUM = `${puppeteer.executablePath()}`;

// if this test run is happening in the CI environment report our test run a little differently
if (isBamboo) {
  fs.mkdirsSync('./build/test-results');
  process.env.MOCHA_FILE = './build/test-results/mocha.json';
  // need to import reporter after MOCHA_FILE env var has been set
  reporter = require('mocha-bamboo-reporter'); // eslint-disable-line global-require
}

const args = ['--headless', '--disable-gpu', '--remote-debugging-port=9222'];

// puppeteer's Chromium 81 exits on startup on Ubuntu 24.04 because its seccomp filter keeps
// crashing the GPU process. This turns off only the seccomp layer; the namespace sandbox stays on.
if (process.platform === 'linux') {
  args.push('--disable-seccomp-filter-sandbox');
}

module.exports = {
  browsers: [{ browser: 'chromium', args }],
  reporter,
};
