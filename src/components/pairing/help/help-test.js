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

import $ from 'jquery';
import fixture from 'can-fixture/';
import CanMap from 'can-map';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import './help';

const helpSteps = [{
  id: 'remediation/reset',
  order: 4,
  action: 'FACTORY_RESET',
  message: 'Do a factory reset on the device.',
}, {
  id: 'remediation/closer',
  order: 1,
  action: 'LINK',
  message: 'Move device closer to the hub.',
  linkText: 'Hello World',
  linkUrl: 'https://google.com',
}, {
  id: 'remediation/mode',
  order: 2,
  action: 'INFO',
  message: 'Ensure the device is in pairing mode per the manufacturer\'s instructions.',
}, {
  id: 'remediation/steps',
  order: 3,
  action: 'PAIRING_STEPS',
  message: 'Confirm that the pairing steps were properly followed.',
}];

let cleanupAfterRender;
const scope = new CanMap({
  helpSteps,
});

describe('i2web/components/pairing/help', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-pairing-help {help-steps}="helpSteps" />',
      scope,
      appScope: {
      },
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
      done();
    }).catch(() => {
      console.error(arguments);
      done();
    });
  });

  afterEach(function after(done) {
    cleanupAfterRender().then(() => {
      done();
    }).catch(() => {
      console.error(arguments);
      done();
    });
  });

  describe('rendering', function rendering() {
    it('shall be rendered on the page', function isRendered() {
      assert.isAtLeast($('arcus-pairing-help').children().length, 1, 'arcus-pairing-help is rendered');
    });
  });
});
