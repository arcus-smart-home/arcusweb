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
import canMap from 'can-map';
import assert from 'chai';
import renderTemplate from 'i2web/test/util/renderTemplate';
import './lights-switches';

import Subsystem from 'i2web/models/subsystem';
import subsystems from 'i2web/models/fixtures/data/subsystem.json';

const template = '<arcus-subsystem-status-lights-switches {subsystem}="subsystem" />';
const subsys = new canMap(subsystems['3d496bfc-1098-493e-afd4-7f56c12dbef6'].subsystems[8]);
let data;
let render;
let cleanupRender;

describe('i2web/components/subsystem/status/lights-switches', function tests() {
  beforeEach(function beforeEach() {
    data = new canMap({
      subsystem: new Subsystem(subsys),
    });
    ({ render, cleanupRender } = renderTemplate('#test-area', template, data));
    render();
  });

  afterEach(function afterEach() {
    cleanupRender();
  });

  describe('rendering', function rendering() {
    it('shall render the number of "on" devices', function on() {
      const count = $('arcus-subsystem-status-lights-switches .total-count p').text();
      assert.equal(count.split(' /')[0], '5', 'The on count of this subsystem is 5');
    });

    it('shall render the total number of devices', function total() {
      const count = $('arcus-subsystem-status-lights-switches .total-count p').text();
      assert.equal(count.split('/')[1].split(' ')[0], '8', 'The total count of this subsystem is 8');
    });
  });

  describe('updates', function updates() {
    it('it shall update the on devices when the subsystem changes', function updateOn() {
      const current = data.attr('subsystem.sublightsnswitches:onDeviceCounts.switch'); // should be 3
      data.attr('subsystem.sublightsnswitches:onDeviceCounts', {
        switch: current + 1,
        dimmer: 0,
        light: 0,
      });
      const count = $('arcus-subsystem-status-lights-switches .total-count p').text();
      assert.equal(count.split(' /')[0],
        `${(current + 1)}`,
        'The on count of this subsystem is 4');
    });

    it('it shall update the total devices when the subsystem changes', function updateTotal() {
      const current = data.attr('subsystem.sublightsnswitches:switchDevices'); // should be 8
      current.push('DRIV:dev:33e4ec95-1b34-4c48-827c-2aabff821bbb');
      const count = $('arcus-subsystem-status-lights-switches .total-count p').text();
      assert.equal(count.split('/')[1].split(' ')[0],
        '9',
        'The total count of this subsystem is 9');
    });
  });
});
