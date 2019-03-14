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
import F from 'funcunit';
import stache from 'can-stache';
import { cloneDeep, first } from 'lodash';

import './card';
import Device from 'i2web/models/device';
import Subsystem from 'i2web/models/subsystem';
import subsystemsFixture from 'i2web/models/fixtures/data/subsystem.json';
import hoseTimerFixture from 'i2web/models/fixtures/data/device/orbit_hose_timer_mock.json';

describe('i2web/components/subsystem/lawn-garden/card', function lawnAndGarden() {
  this.timeout(5000);

  const subsystemsId = Object.keys(subsystemsFixture)[0];
  const lawnAndGardenFixture = first(
    subsystemsFixture[subsystemsId].subsystems.filter(function isLawnAndGarden(
      subsystem,
    ) {
      return subsystem['subs:name'] === 'LawnNGardenSubsystem';
    }),
  );

  const deviceAddress = hoseTimerFixture['base:address'];
  const template = stache(`
    <arcus-subsystem-card-lawn-garden
      {subsystem}="subsystem"
      {app-state}="appState"
    />
  `);

  describe('no devices paired', function noDevices() {
    beforeEach(function beforeEach(done) {
      const subsystemFixture = cloneDeep(lawnAndGardenFixture);
      subsystemFixture['sublawnngarden:controllers'] = [];
      subsystemFixture['sublawnngarden:zonesWatering'] = {};

      // render component
      const appState = new CanMap({ devices: new Device.List([]) });
      const subsystem = new Subsystem(subsystemFixture);
      const scope = new CanMap({ subsystem, appState });
      $('#test-area').append(template(scope));
      F('arcus-subsystem-card-lawn-garden').exists(() => done());
    });

    afterEach(function afterEach() {
      $('#test-area').empty();
    });

    it('renders card title', function cardTitle() {
      assert.ok(
        $('.subsystem-card-title').length,
        'card content should not be rendered',
      );
      assert.include($('.total-count').text(), '0', '0 devices paired');
    });

    it('does not render card content', function cardContent() {
      assert.notOk(
        $('.subsystem-card-contents').length,
        'card content should not be rendered',
      );
    });
  });

  describe('devices paired but offline', function offline() {
    beforeEach(function beforeEach(done) {
      // add irrigation device and watering zone
      const subsystemFixture = cloneDeep(lawnAndGardenFixture);
      subsystemFixture['sublawnngarden:controllers'] = [deviceAddress];
      subsystemFixture['sublawnngarden:zonesWatering'] = {
        [deviceAddress]: {
          controller: deviceAddress,
          duration: 1,
          startTime: 1522267356177,
          trigger: 'MANUAL',
          zone: 'z1',
        },
      };

      // set device to offline
      const device = cloneDeep(hoseTimerFixture);
      device['devconn:state'] = 'OFFLINE';

      // render component
      const appState = new CanMap({ devices: new Device.List([device]) });
      const subsystem = new Subsystem(subsystemFixture);
      const scope = new CanMap({ subsystem, appState });
      $('#test-area').append(template(scope));
      F('arcus-subsystem-card-lawn-garden').exists(() => done());
    });

    afterEach(function afterEach() {
      $('#test-area').empty();
    });

    it('render error messages', function error() {
      assert.equal(
        $('.status-header .error').length,
        2,
        'device offline error should be rendered',
      );
      assert.include(
        $('.status-header .error')
          .first()
          .text()
          .toLowerCase(),
        'device(s) offline',
      );
    });
  });

  describe('devices paired, nothing watering nor scheduled', function nono() {
    beforeEach(function beforeEach(done) {
      // add irrigation device
      const subsystemFixture = cloneDeep(lawnAndGardenFixture);
      subsystemFixture['sublawnngarden:controllers'] = [deviceAddress];
      subsystemFixture['sublawnngarden:zonesWatering'] = {};
      subsystemFixture['sublawnngarden:nextEvent'] = null;

      // render component
      const device = cloneDeep(hoseTimerFixture);
      const appState = new CanMap({ devices: new Device.List([device]) });
      const subsystem = new Subsystem(subsystemFixture);
      const scope = new CanMap({ subsystem, appState });
      $('#test-area').append(template(scope));
      F('arcus-subsystem-card-lawn-garden').exists(() => done());
    });

    afterEach(function afterEach() {
      $('#test-area').empty();
    });

    it('renders message to set schedule', function message() {
      assert.include(
        $('.status-header')
          .first()
          .text(),
        'Set a custom schedule',
      );
    });

    it('renders navigate to status page button', function button() {
      assert.include(
        $('.status-header button')
          .text()
          .toLowerCase(),
        'view lawn & garden devices',
      );
    });
  });

  describe('something watering and something scheduled', function soso() {
    beforeEach(function beforeEach(done) {
      // add irrigation device, watering zone and schedule event
      const subsystemFixture = cloneDeep(lawnAndGardenFixture);
      subsystemFixture['sublawnngarden:controllers'] = [deviceAddress];
      subsystemFixture['sublawnngarden:zonesWatering'] = {
        [deviceAddress]: {
          controller: deviceAddress,
          duration: 1,
          startTime: 1522267356177,
          trigger: 'MANUAL',
          zone: 'z1',
        },
      };
      subsystemFixture['sublawnngarden:nextEvent'] = {
        controller: deviceAddress,
        duration: 1,
        retryCount: 0,
        startTime: 1522321200000,
        status: 'PENDING',
        timeOfDay: '6:00:00',
        zone: 'z1',
      };

      // set up device
      const device = cloneDeep(hoseTimerFixture);
      device['irr:zonename:z1'] = 'Veggie Garden';

      // render component
      const appState = new CanMap({ devices: new Device.List([device]) });
      const subsystem = new Subsystem(subsystemFixture);
      const scope = new CanMap({ subsystem, appState });
      $('#test-area').append(template(scope));
      F('arcus-subsystem-card-lawn-garden').exists(() => done());
    });

    afterEach(function afterEach() {
      $('#test-area').empty();
    });

    it('renders watering info', function watering() {
      assert.include(
        $('.status-header h3')
          .first()
          .text()
          .toLowerCase(),
        'watering',
      );
      assert.include(
        $('.status-header .zone-name')
          .first()
          .text()
          .toLowerCase(),
        'veggie garden',
      );
    });

    it('renders schedule info', function schedule() {
      assert.include(
        $('.status-header h3')
          .eq(1)
          .text()
          .toLowerCase(),
        'next zone',
      );
      assert.include(
        $('.status-header .zone-name')
          .eq(1)
          .text()
          .toLowerCase(),
        'veggie garden:',
      );
    });
  });
});
