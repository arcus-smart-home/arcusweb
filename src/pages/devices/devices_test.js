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
import Place from 'i2web/models/place';
import Device from 'i2web/models/device';
import Hub from 'i2web/models/hub';
import Places from 'i2web/models/fixtures/data/place/place.json';
import Buttons from 'i2web/models/fixtures/data/device/buttons.json';
import Hubs from 'i2web/models/fixtures/data/device/hub.json';
import 'i2web/pages/devices/';

let cleanupAfterRender;

function renderWithScope(scope, cb) {
  loginAndRender({
    renderTo: '#test-area',
    template: '<arcus-page-devices {hub}="hub" {devices}="devices" {place}="place"/>',
    scope,
  }).then(({ cleanup }) => {
    cleanupAfterRender = cleanup;
    cb();
  }).catch(() => {
    console.error(arguments);
  });
}

describe('i2web/pages/devices', function devices() {
  before(function before() {
    fixture.reset();
  });

  describe('initial render', function rendering() {
    beforeEach(function beforeEach(done) {
      renderWithScope({
        place: new Place(Places[0]),
        devices: new Device.List(Buttons),
        hub: new Hub(Object.assign({ 'base:address': '123456' }, Hubs[0])),
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
      assert.lengthOf($('arcus-page-devices'), 1, 'there is one component rendered');
    });
  });

  describe('rendering hub', function renderingHub() {
    beforeEach(function beforeEach(done) {
      renderWithScope({
        place: new Place(Places[0]),
        devices: new Device.List(Buttons),
        hub: new Hub(Object.assign({ 'base:address': '123456' }, Hubs[0])),
      }, done);
    });

    afterEach(function afterEach(done) {
      cleanupAfterRender().then(() => {
        done();
      }).catch(() => {
        console.error(arguments);
      });
    });
    it('shall render an arcus-hub-panel for the hub', function hubPanel() {
      assert.lengthOf($('arcus-hub-panel'), 1, 'there was 1 hub rendered');
    });
  });
});
