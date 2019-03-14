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
import CanMap from 'can-map';
import fixture from 'can-fixture/';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import './card';
import subsystems from 'i2web/models/fixtures/data/subsystem.json';
import thermostats from 'i2web/models/fixtures/data/device/thermostats.json';
import Subsystem from 'i2web/models/subsystem';
import Device from 'i2web/models/device';

let cleanupAfterRender;
let scope;
let appScope;

const _subsystems = new Subsystem.List(subsystems['bf8bf389-80d1-4dcd-9d9f-7d3d51ac5177'].subsystems);
const _unpairedSubsystem = new Subsystem.List(subsystems['3d496bfc-1098-493e-afd4-7f56c12dbef6'].subsystems);

describe('i2web/components/subsystem/climate/card', () => {
  before(function before() {
    fixture.reset();
  });

  beforeEach((done) => {
    scope = new CanMap({
      subsystem: new CanMap(_subsystems[3]),
    });
    // scope = new CanMap({});
    appScope = new CanMap({
      devices: new Device.List([
        new Device(thermostats[0]),
        new Device(thermostats[1]),
      ]),
    });
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-subsystem-card-climate {subsystem}="subsystem" />',
      scope,
      appScope,
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
      assert.isAtLeast($('arcus-subsystem-card-climate').children().length, 1, 'arcus-subsystem-card-climate is rendered');
    });

    it('shall display the total number of climate devices in the upper right corner of the card', () => {
      assert.equal($('arcus-subsystem-card-climate .total-count p').text(), '1 Total', 'total number of devices is correct');
    });


    it('shall display a temperature header, the name and temperature of the preferred temperature sensing device, and a thermometer icon on the left side of the card', () => {
      const temperatureHeader = $('arcus-subsystem-card-climate .subsystem-status-temperature .status-header h3');
      const deviceName = $('arcus-subsystem-card-climate .subsystem-status-temperature p.device-name');
      const thermometerIcon = $('arcus-subsystem-card-climate .subsystem-status-temperature .icon-app-thermometer');

      assert.isAtLeast(temperatureHeader.length, 1, 'Temperature header rendered properly');
      assert.isAtLeast(deviceName.length, 1, 'Device name rendered properly');
      assert.isAtLeast(thermometerIcon.length, 1, 'Thermometer icon rendered properly');
    });

    it('shall display a Humidity header, the name and humidity level of the preferred humidity sensing device, and a humidity icon on the right side of the card', () => {
      const humidityHeader = $('arcus-subsystem-card-climate .subsystem-status-humidity .status-header h3');
      const deviceName = $('arcus-subsystem-card-climate .subsystem-status-humidity p.device-name');
      const humidityIcon = $('arcus-subsystem-card-climate .subsystem-status-humidity .icon-app-hot-water');

      assert.isAtLeast(humidityHeader.length, 1, 'Humidity header rendered properly');
      assert.isAtLeast(deviceName.length, 1, 'Device name rendered properly');
      assert.isAtLeast(humidityIcon.length, 1, 'Humidity icon rendered properly');
    });

    it('shall display "Offline" under the device name when the preferred temperature sensing device is offline', () => {
      scope.attr('subsystem', _subsystems[4]);
      const offlineStatus = $('arcus-subsystem-card-climate .subsystem-status-temperature small.error');
      assert.isAtLeast(offlineStatus.length, 1, 'Offline status rendered properly');
    });

    it('shall display "Offline" under the device name when the preferred humidity sensing device is offline', () => {
      scope.attr('subsystem', _subsystems[4]);
      const offlineStatus = $('arcus-subsystem-card-climate .subsystem-status-humidity small.error');
      assert.isAtLeast(offlineStatus.length, 1, 'Offline status rendered properly');
    });

    it('shall display a Temperature header, "0 Devices Paired" and a shopping cart button on the left side of the card when there are no temperature sensing devices', () => {
      scope.attr('subsystem', _unpairedSubsystem[3]);

      const pairedHeader = $('arcus-subsystem-card-climate .subsystem-status-temperature small');

      assert.isAtLeast(pairedHeader.length, 1, 'Paired devices rendered properly');
      assert.equal(pairedHeader.text(), '0 Devices Paired', 'Paired devices text rendered properly');
    });

    it('shall display a Humidity header, "0 Devices Paired" and a shopping cart button on the right side of the card when there are no humidity sensing devices', () => {
      scope.attr('subsystem', _unpairedSubsystem[3]);
      const pairedHeader = $('arcus-subsystem-card-climate .subsystem-status-humidity small');
      assert.isAtLeast(pairedHeader.length, 1, 'Paired devices rendered properly');
      assert.equal(pairedHeader.text(), '0 Devices Paired', 'Paired devices text rendered properly');
    });
  });
});
