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

import assert from 'chai';
import F from 'funcunit';
import cloneDeep from 'lodash/cloneDeep';
import stache from 'can-stache';

import contactSensorsFixture from 'i2web/models/fixtures/data/device/contact_sensors.json';
import Device from 'i2web/models/device';
import swannCameraFixture from 'i2web/models/fixtures/data/device/swann_camera.json';
import './powerSource.component';

describe('device badges', function deviceBadges() {
  const getContainer = () => document.querySelector('#test-area');

  describe('arcus-device-badge-powersource', function powersource() {
    const template = stache(`
      <arcus-device-badge-powersource {(device)}="device" />
    `);

    afterEach(function afterEach() {
      const el = getContainer();
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    });

    it('non swann cameras should show OK if battery > 30%', function rendersOk(done) {
      const device = new Device(cloneDeep(contactSensorsFixture[0]));
      getContainer().appendChild(template({ device }));
      assert(device.attr('devpow:battery') > 30, '>30%');

      F('arcus-device-badge-powersource').exists();
      F('.value-unit').missing('percentage should not be rendered');
      F('.device-status-detail').text(/ok/i);
      F(() => done());
    });

    it('non swann cameras should show percentage if battery < 30%', function low(done) {
      const device = new Device(cloneDeep(contactSensorsFixture[0]));
      device.attr('devpow:battery', 29);

      getContainer().appendChild(template({ device }));

      F('arcus-device-badge-powersource').exists();
      F('.low-battery').text(/29%/i);
      F(() => done());
    });

    it('swann cameras show battery percentage always', function always(done) {
      const device = new Device(cloneDeep(swannCameraFixture));
      assert(!!device.attr('swannbatterycamera:sn'), 'should be a swann camera');
      assert(device.attr('devpow:battery') > 30, 'battery level >30%');

      getContainer().appendChild(template({ device }));

      F('arcus-device-badge-powersource').exists();
      F('.device-status-detail').text(/88%/i);
      F(() => done());
    });

    it('swann cameras flag low battery level if battery < 30%', function low(done) {
      const device = new Device(cloneDeep(swannCameraFixture));
      device.attr('devpow:battery', 29);
      assert(!!device.attr('swannbatterycamera:sn'), 'should be a swann camera');

      getContainer().appendChild(template({ device }));

      F('arcus-device-badge-powersource').exists();
      F('.low-battery').text(/29%/i);
      F(() => done());
    });
  });
});
