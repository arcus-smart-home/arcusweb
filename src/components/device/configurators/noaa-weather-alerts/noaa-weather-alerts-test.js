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
import './noaa-weather-alerts';
import canMap from 'can-map';
import Device from 'i2web/models/device';
import halos from 'i2web/models/fixtures/data/device/halos.json';
import weatheralerts from 'config/weatheralerts.json';
import canViewModel from 'can-view-model';

let cleanupAfterRender;

const parentscope = new canMap({});

describe('i2web/components/device/configurators/noaa-weather-alerts', function favorite() {
  let scope;
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-device-configurator-noaa-weather-alerts {device}="device" />',
      parentscope,
      appScope: {},
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
      scope = canViewModel($('arcus-device-configurator-noaa-weather-alerts')[0]);
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
    it('shall be rendered on the page without a device', function isRendered() {
      assert.lengthOf($('arcus-device-configurator-noaa-weather-alerts'), 1, 'noaa-weather-alerts is rendered');
    });
    it('shall be rendered on the page with a device', function isRenderedWithDevice() {
      scope.attr('device', new Device(halos[0]));
      assert.lengthOf($('arcus-device-configurator-noaa-weather-alerts'), 1, 'noaa-weather-alerts is rendered');
    });
  });

  describe('viewModel/alertsOfInterest', function vm() {
    beforeEach(function before() {
      scope.attr('device', new Device(halos[0]));
      scope.attr('device.noaa:alertsofinterest', ['AVA']);
    });

    it('should include alerts user has selected', function includeSelected() {
      assert.deepEqual(scope.attr('alertsOfInterest'), [weatheralerts[0]]);
    });
    it('should not include alerts user has not selected', function excludeNotSelected() {
      assert.notDeepEqual(scope.attr('alertsOfInterest'), [weatheralerts[1]]);
    });
    it('should work work if alertsofinterest is empty', function noAlerts() {
      scope.attr('device.noaa:alertsofinterest', []);
      assert.deepEqual(scope.attr('alertsOfInterest'), []);
    });
    it('should work work if alertsofinterest doesn\'t exist', function nullAlerts() {
      scope.attr('device.noaa:alertsofinterest', null);
      assert.deepEqual(scope.attr('alertsOfInterest'), []);
    });
    it('should work if there is no device', function noDevice() {
      scope.attr('device', null);
      assert.deepEqual(scope.attr('alertsOfInterest'), []);
    });
  });

  describe('interactivity', function interactivity() {

  });
});
