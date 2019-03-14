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

import _ from 'lodash';
import fixture from 'can-fixture/';
import F from 'funcunit';
import assert from 'chai';
import stache from 'can-stache';
import CanMap from 'can-map';
import nestThermostatData from 'i2web/models/fixtures/data/device/nest_thermostats.json';
import temperatureConverter from 'i2web/plugins/temperature-converter';
import ThermostatCapabilities from 'i2web/models/capability/Thermostat';
import Device from 'i2web/models/device';
import './thermostat-slider';
// need to include polyfill for Babel transpiled async/await
import 'babel-polyfill';


let testArea = null;
let vm = null;
const template = stache(`
  <arcus-device-action-thermostat-slider {device}="device"/>
`);

function initComponent() {
  return new Promise((resolve) => {
    const testDevice = new Device(nestThermostatData[0]);
    vm = new CanMap({ device: testDevice });
    testArea.appendChild(template(vm));

    // wait to initialize noUiSlider
    setTimeout(resolve, 20);
  });
}
function cleanUpComponent() {
  testArea.innerHTML = '';
}


describe('i2web/components/device/actions/thermostat-slider', function favorite() {
  before(function beforeSuite() {
    testArea = document.getElementById('test-area');
    fixture.reset();
    cleanUpComponent(); // clean up anything that might be leftover from another test
  });

  describe('rendering', function rendering() {
    before(() => { return initComponent(); });
    after(() => { cleanUpComponent(); });

    it('shall be rendered on the page', function isRendered() {
      assert.ok(document.getElementsByTagName('arcus-device-action-thermostat-slider')[0]);
    });
  });

  describe('auto', function autoTests() {
    before(async function beforeAuto() {
      await initComponent();
      vm.attr('device.therm:hvacmode', ThermostatCapabilities.HVACMODE_AUTO);
      // wait for mode-change rerender to finish
      return new Promise(resolve => setTimeout(resolve, 20));
    });
    after(() => { cleanUpComponent(); });

    describe('handles', function autoHandlesTests() {
      it('renders two handles', () => {
        assert.equal(testArea.querySelectorAll('.noUi-handle').length, 2);
      });

      it('positions handles based on temperature', () => {
        const handles = testArea.querySelectorAll('.noUi-origin');
        const handlePositions = Array.prototype.map.call(handles, el => parseFloat(el.style.left));
        const rangeSize = vm.attr('device.therm:maxsetpoint') - vm.attr('device.therm:minsetpoint');
        const heatHandlePosition = _.round(((vm.attr('device.therm:heatsetpoint') - vm.attr('device.therm:minsetpoint')) / rangeSize) * 100, 4);
        const coolHandlePosition = _.round(((vm.attr('device.therm:coolsetpoint') - vm.attr('device.therm:minsetpoint')) / rangeSize) * 100, 4);
        assert.deepEqual(handlePositions, [heatHandlePosition, coolHandlePosition]);
      });

      it('updates output button value on handle move', async () => {
        const startingValue = testArea.querySelector('button.btn-value').innerHTML;
        await new Promise(resolve => F('.noUi-handle:first').drag('100x0', resolve));
        const endingValue = testArea.querySelector('button.btn-value').innerHTML;
        assert.notEqual(startingValue, endingValue);
      });

      it('maintains the setpoint separation when dragging handle', async () => {
        const margin = vm.attr('device.therm:setpointseparation');

        // drag heat handle as far right as possible
        await new Promise(resolve => F('.noUi-handle:first').drag('-1000x0', resolve));
        // get difference between heatsetpoint and coolsetpoint
        const difference = _.round(vm.attr('device.therm:coolsetpoint') - vm.attr('device.therm:heatsetpoint'), 10);
        // may be mild difference in values due to slider snapping to closest fahrenheit degree
        assert.closeTo(margin, difference, 0.00001, 'difference between heat and cool setpoints is approximately equal to temperature separation minimum');
      });

      it('shows a darker grey shading between the two setpoints', () => {
        // assert that slider element connecting handles exists
        assert.ok(testArea.querySelector('.noUi-connect'));
      });
    });

    describe('buttons', function autoButtonTests() {
      it('has two value output buttons', () => {
        const valueButtons = testArea.querySelectorAll('.btn-value');
        assert.equal(valueButtons.length, 2, 'has two buttons');
        assert.equal(parseInt(valueButtons[0].innerHTML, 10), temperatureConverter(vm.attr('device.therm:heatsetpoint')), 'first button outputs heat set point');
        assert.equal(parseInt(valueButtons[1].innerHTML, 10), temperatureConverter(vm.attr('device.therm:coolsetpoint')), 'second button outputs cool set point');
      });

      it('selects corresponding slider handle when button clicked', async () => {
        const valueButtons = testArea.querySelectorAll('.btn-value');
        const handles = testArea.querySelectorAll('.noUi-handle');
        assert.notOk(handles[1].classList.contains('active'), 'starts deselected');
        await new Promise(resolve => F(valueButtons[1]).click(resolve));
        assert.ok(handles[1].classList.contains('active'), 'selected after click');
        await new Promise(resolve => F(valueButtons[0]).click(resolve));
        assert.ok(handles[0].classList.contains('active'), 'correct handle selected');
      });

      it('increment buttons update setpoint', async () => {
        const incrementButtons = testArea.querySelectorAll('.btn-increment');
        const initialValue = vm.attr('device.therm:heatsetpoint');
        const oneDegree = temperatureConverter(1, 'C', false);
        await new Promise(resolve => F(incrementButtons[0]).click(resolve));
        assert.closeTo(vm.attr('device.therm:heatsetpoint'), initialValue - oneDegree, 0.00001);
        await new Promise(resolve => F(incrementButtons[1]).click().click(resolve));
        assert.closeTo(vm.attr('device.therm:heatsetpoint'), initialValue + oneDegree, 0.00001);
      });

      it('increment buttons respect setpoint separation', async () => {
        const incrementButtons = testArea.querySelectorAll('.btn-increment');
        const margin = vm.attr('device.therm:setpointseparation');
        // set points temperature separation distance + 1 degrees apart
        vm.attr('device.therm:heatsetpoint', temperatureConverter(50, 'C'));
        vm.attr('device.therm:coolsetpoint', temperatureConverter(51, 'C') + margin);
        // move two degrees closer together
        await new Promise(resolve => F(incrementButtons[1]).click().click(resolve));
        const difference = _.round(vm.attr('device.therm:coolsetpoint') - vm.attr('device.therm:heatsetpoint'), 10);
        // may be mild difference in values due to slider snapping to closest fahrenheit degree
        assert.closeTo(margin, difference, 0.00001, 'difference between heat and cool setpoints is approximately equal to temperature separation minimum');
      });
    });

    describe('lock points', function lockPointTests() {
      it('has two lock points', () => {
        const lockPoints = testArea.querySelectorAll('.temp-lock');
        assert.equal(lockPoints.length, 2);
      });

      it('doesnt allow values past the lock points', async () => {
        const lowLockPointValue = vm.attr('device.nesttherm:lockedtempmin');
        const highLockPointValue = vm.attr('device.nesttherm:lockedtempmax');
        // set values past lock points
        vm.attr('device.therm:heatsetpoint', lowLockPointValue - 5);
        vm.attr('device.therm:coolsetpoint', highLockPointValue + 5);
        // wait for slider events to fire
        await new Promise(resolve => setTimeout(resolve, 1));
        // assert setpoints snapped to lock points
        assert.equal(vm.attr('device.therm:heatsetpoint'), lowLockPointValue);
        assert.equal(vm.attr('device.therm:coolsetpoint'), highLockPointValue);
      });
    });

    describe('gradients', function gradientTests() {
      it('shows orange gradient when current temperature is lower than the heat setpoint', () => {
        const currentTempConnect = testArea.querySelector('.current-temp-connect');
        assert.notOk(currentTempConnect.classList.contains('heat-gradient'));
        vm.attr('device.temp:temperature', vm.attr('device.therm:heatsetpoint') - 1);
        assert.ok(currentTempConnect.classList.contains('heat-gradient'));
      });

      it('shows blue gradient when current temperature is hight than the cool setpoint', () => {
        const currentTempConnect = testArea.querySelector('.current-temp-connect');
        assert.notOk(currentTempConnect.classList.contains('cool-gradient'));
        vm.attr('device.temp:temperature', vm.attr('device.therm:coolsetpoint') + 1);
        assert.ok(currentTempConnect.classList.contains('cool-gradient'));
      });
    });
  });
});
