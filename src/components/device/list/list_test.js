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
import Device from 'i2web/models/device';
import Buttons from 'i2web/models/fixtures/data/device/buttons.json';
import 'i2web/components/device/list/';

let cleanupAfterRender;

function renderWithScope(scope, cb) {
  loginAndRender({
    renderTo: '#test-area',
    template: '<arcus-device-list {devices}="devices" />',
    scope,
  }).then(({ cleanup }) => {
    cleanupAfterRender = cleanup;
    cb();
  }).catch(() => {
    console.error(arguments);
  });
}

describe('i2web/components/device/list', function devices() {
  before(function before() {
    fixture.reset();
  });

  describe('initial render', function rendering() {
    beforeEach(function beforeEach(done) {
      renderWithScope({
        devices: new Device.List(Buttons),
      }, done);
    });

    afterEach(function afterEach(done) {
      cleanupAfterRender().then(() => {
        done();
      }).catch(() => {
        console.error(arguments);
      });
    });
    it('shall be rendered on the page', function rendered() {
      assert.lengthOf($('arcus-device-list'), 1, 'there is one component rendered');
    });
  });

  describe('rendering all devices', function renderingAll() {
    beforeEach(function beforeEach(done) {
      renderWithScope({
        devices: new Device.List(Buttons),
      }, done);
    });

    afterEach(function afterEach(done) {
      cleanupAfterRender().then(() => {
        done();
      }).catch(() => {
        console.error(arguments);
      });
    });
    it('shall render an arcus-device-panel for each device on the place', function devicePanels() {
      assert.lengthOf($('arcus-device-panel'), 2, 'there were 2 devices rendered');
    });
  });
});
