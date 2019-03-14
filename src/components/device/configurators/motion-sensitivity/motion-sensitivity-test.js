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
import assert from 'chai';
import CanMap from 'can-map';
import canViewModel from 'can-view-model';
import F from 'funcunit';
import stache from 'can-stache';

import Device from 'i2web/models/device';
import './motion-sensitivity';

describe('i2web/components/device/configurators/motion-sensitivity', function motion() {
  const template = stache(`
    <arcus-device-configurator-motion-sensitivity {(device)}= "device" />
  `);

  describe('when motion detection is off on init', function offOnInit() {
    beforeEach(function be(done) {
      const device = new Device({
        'mot:sensitivitiesSupported': ['HIGH', 'LOW', 'MAX', 'MED', 'OFF'],
        'mot:sensitivity': 'OFF',
      });
      device.save = () => Promise.resolve();
      const scope = new CanMap({ device });
      $('#test-area').append(template(scope));
      F('arcus-device-configurator-motion-sensitivity').exists(() => done());
    });

    afterEach(function ae() {
      $('#test-area').empty();
    });

    it('dropdown has correct value', function initialValue() {
      assert.equal($('.dropdown .selected').data('value'), 'OFF');
    });

    it('does not render warning', function noWarning() {
      assert.equal($('.form-error').length, 0, 'should not render warning');
    });
  });

  describe('turning off motion sensitivity', function turnOff() {
    beforeEach(function be(done) {
      const device = new Device({
        'mot:sensitivitiesSupported': ['HIGH', 'LOW', 'MAX', 'MED', 'OFF'],
        'mot:sensitivity': 'HIGH',
      });
      device.save = () => Promise.resolve();
      const scope = new CanMap({ device });
      $('#test-area').append(template(scope));
      F('arcus-device-configurator-motion-sensitivity').exists(() => done());
    });

    afterEach(function ae() {
      $('#test-area').empty();
    });

    it('warns user before commiting change', function warn(done) {
      const vm = canViewModel(
        $('arcus-device-configurator-motion-sensitivity').get(0),
      );
      vm.attr('selectedMotionSensitivity', 'OFF');
      F('.form-error').exists('shows warning');
      F('.form-error .turn-off').exists('shows turn off button');
      F('.form-error .cancel').exists('shows cancel button');
      F(() => done());
    });

    it('clicking cancel resets selected value', function reset(done) {
      const vm = canViewModel(
        $('arcus-device-configurator-motion-sensitivity').get(0),
      );
      vm.attr('selectedMotionSensitivity', 'OFF');

      F('.dropdown .selected').attr('data-value', 'OFF');
      F('.form-error').exists('shows warning');

      F('button.cancel').click();
      F('.dropdown .selected').attr('data-value', 'HIGH');
      F('.form-error').missing('hides warning');
      F(() => done());
    });

    it('clicking "yes, turn off" turns off device motion detection', function doTurnOff(done) {
      const vm = canViewModel(
        $('arcus-device-configurator-motion-sensitivity').get(0),
      );
      vm.attr('selectedMotionSensitivity', 'OFF');

      F('.dropdown .selected').attr('data-value', 'OFF');
      F('.form-error').exists('shows warning');

      F('button.turn-off').click();
      F('.dropdown .selected').attr('data-value', 'OFF');
      F('.form-error').missing('hides warning');
      F(() => done());
    });
  });
});
