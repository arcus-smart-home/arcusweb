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
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import { ViewModel } from './device';

let cleanupAfterRender;

describe('i2web/components/pairing/customize/device', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-pairing-customize-device {message}="message" />',
      scope: {
        message: 'This is the arcus-pairing-customize-device component',
      },
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
      assert.isAtLeast(
        $('arcus-pairing-customize-device').children().length,
        1,
        'arcus-pairing-customize-device is rendered',
      );
    });
  });
});

describe('Device ViewModel', function viewModelTests() {
  it('accepts ROOM as a customization step', function roomStep() {
    const vm = new ViewModel();

    vm.attr('customizationSteps', [{
      action: 'ROOM',
      choices: null,
      description: [],
      header: '',
    }]);

    assert.equal(vm.attr('customizationSteps.0.action'), 'ROOM');
  });
});
