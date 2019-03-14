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
import F from 'funcunit';
import fixture from 'can-fixture/';
import CanMap from 'can-map';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import Device from 'i2web/models/device';
import ThermostatDeviceData from 'i2web/models/fixtures/data/device/thermostats.json';
import './thermostat';

let cleanupAfterRender;

const thermostat = new Device(ThermostatDeviceData[0]);
const scope = new CanMap({
  device: thermostat,
  scheduleEnabled: false,
  mode: 'AUTO',
  heatSetPoint: 23.888,
  coolSetPoint: 27.888,
  autoSupported: true,
});

describe('i2web/components/thermostat', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: `
        <arcus-thermostat
          {device}="device"
          {(schedule-enabled)}="scheduleEnabled"
          {(mode)}="mode"
          {(heat-setpoint)}="heatSetPoint"
          {(cool-setpoint)}="coolSetPoint"
          {min-setpoint}="10"
          {max-setpoint}="32"
          {setpoint-separation}="1.67"
          {auto-supported}="autoSupported"
          {eco-supported}="ecoSupported"
        />
      `,
      scope,
      appScope: {},
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
      assert.isAtLeast($('arcus-thermostat').children().length, 1, 'arcus-thermostat is rendered');
    });
  });

  describe('interaction', function interaction() {
    it('sets scheduleEnabled to true when you click "Use Schedule"', function scheduleEndabled(done) {
      F('.toggle-control').click(() => {
        const scheduleEnabled = scope.attr('scheduleEnabled');
        assert.ok(scheduleEnabled, 'schedule is enabled after clicking');
        done();
      });
    });
    it('shall show 0 arcus-spinners when mode is OFF', function off0spinner() {
      scope.attr('mode', 'OFF');

      const spinners = document.querySelectorAll('arcus-spinner').length;
      assert.equal(spinners, 0, 'off mode shows 0 spinners');
    });
    it('shall show 2 arcus-spinner when mode is AUTO', function auto2spinners() {
      scope.attr('mode', 'AUTO');

      const spinners = document.querySelectorAll('arcus-spinner').length;
      assert.equal(spinners, 2, 'auto mode shows 2 spinners');
    });
    it('shall show 1 arcus-spinner when mode is COOL', function cool1spinner() {
      scope.attr('mode', 'COOL');

      const spinners = document.querySelectorAll('arcus-spinner').length;
      assert.equal(spinners, 1, 'cool mode shows 1 spinners');
    });
    it('shall show 1 arcus-spinner when mode is HEAT', function heat1spinner() {
      scope.attr('mode', 'HEAT');

      const spinners = document.querySelectorAll('arcus-spinner').length;
      assert.equal(spinners, 1, 'heat mode shows 1 spinners');
    });
  });
});
