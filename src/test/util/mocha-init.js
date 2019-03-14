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


import F from 'funcunit';
import 'jquery';
import steal from '@steal';
import loader from '@loader';
import mocha from 'mocha/mocha';
import 'mocha/mocha.css';
import 'babel-polyfill';

// NOTE: we're not using steal-mocha since we need to control when the tests start.
// when using steal-mocha all of our tests are loaded at the same time as all dependencies and launched immediately thereafter.
// this contributed to a bug where the JQ included w/ funcunit would conflict with the JQ used by the app.
// a JQ plugin that is an app dependency would end up being added to the funcunit version of JQ due to uncontrolled loading order.
// to resolve this we've forced funcunit and jquery to load before we load the tests and their dependencies.

function setupMochaDOM() {
  if (!document.getElementById('mocha')) {
    const mochaDiv = document.createElement('div');
    mochaDiv.id = 'mocha';
    (document.body || document.documentElement).appendChild(mochaDiv);
  }
  if (!document.getElementById('page')) {
    const page = document.createElement('div');
    const testArea = document.createElement('div');

    page.id = 'page';
    testArea.id = 'test-area';
    page.appendChild(testArea);
    (document.body || document.documentElement).appendChild(page);
  }
}

export default function mochaInit(testScriptPath) {
  mocha.setup('bdd');
  F.attach(mocha);
  setupMochaDOM();
  steal.import(testScriptPath).then(() => {
    if (loader.global.Testee) {
      loader.global.Testee.init();
    }
    mocha.run();
  }).catch((e) => {
    throw new Error(e);
  });
}
