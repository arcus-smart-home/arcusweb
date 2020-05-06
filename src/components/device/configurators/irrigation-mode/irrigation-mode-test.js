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

import './irrigation-mode';
import Device from 'i2web/models/device';
import hoseTimerFixture from 'i2web/models/fixtures/data/device/orbit_hose_timer_mock.json';
import Subsystem from 'i2web/models/subsystem';
import subsystemsFixture from 'i2web/models/fixtures/data/subsystem.json';

describe('i2web/components/device/configurators/irrigation-mode', function irrigationMode() {
  this.timeout(5000);

  const template = stache(`
    <arcus-device-configurator-irrigation-mode
      {device}="device"
      {app-state}="appState"
    />
  `);

  describe('rendering with no set schedule', function noSchedule() {
    beforeEach(function be(done) {
      const device = new Device(hoseTimerFixture);
      const appState = new CanMap({
        subsystems: {
          findByName() {
            return null;
          },
        },
      });
      const scope = new CanMap({ appState, device });
      $('#test-area').append(template(scope));
      F('arcus-device-configurator-irrigation-mode').exists(() => done());
    });

    afterEach(function ae() {
      $('#test-area').empty();
    });

    it('renders a list of irrigation modes w/ radio buttons', function works() {
      assert.equal(
        $('li.radio-wrapper').length,
        5,
        'there are 5 modes: weekly, interval, even, odd and manual'
      );
    });

    it('selects MANUAL mode by default', function manual() {
      assert.equal($('li.radio-wrapper input:checked').val(), 'MANUAL');
    });

    it('displays calendar icons for all modes but manual', function calendar() {
      assert.equal($('arcus-schedule-icon').length, 4);
    });

    it('groups modes with no events', function noevents() {
      assert.equal(
        $('.radio-buttons .no-events').length,
        4,
        'all modes but manual have no events'
      );
      assert(
        $('.add-events-message').length,
        'shows message indicating that at least one event should be added',
      );
    });

    it('clicking a mode w/ no event does not change selection', function events() {
      $('li.no-events input')
        .first()
        .click();
      assert.equal(
        $('li.radio-wrapper input:checked').val(),
        'MANUAL',
        'the selected radio button does not change in this case',
      );
    });
  });

  describe('with a currently set schedule mode', function schedule() {
    beforeEach(function be(done) {
      const device = new Device(hoseTimerFixture);
      const subsystemsId = Object.keys(subsystemsFixture)[0];
      const lawnAndGardenFixture = cloneDeep(
        first(
          subsystemsFixture[subsystemsId].subsystems.filter(
            function isLawnAndGarden(subsystem) {
              return subsystem['subs:name'] === 'LawnNGardenSubsystem';
            },
          ),
        ),
      );
      // make WEEKLY the set schedule mode
      lawnAndGardenFixture['sublawnngarden:scheduleStatus'] = {
        [hoseTimerFixture['base:address']]: {
          enabled: true,
          mode: 'WEEKLY',
        },
      };
      // make sure WEEKLY has scheduled events
      lawnAndGardenFixture['sublawnngarden:weeklySchedules'] = {
        [hoseTimerFixture['base:address']]: {
          events: [
            {
              days: ['MON'],
              eventId: '158e911a-d86b-4b85-986f-a802727f5394',
              status: 'APPLIED',
              timeOfDay: '10:00:00',
              type: 'WEEKLY',
            },
          ],
        },
      };
      const appState = new CanMap({
        subsystems: {
          findByName() {
            return new Subsystem(lawnAndGardenFixture);
          },
        },
      });
      const scope = new CanMap({ appState, device });
      $('#test-area').append(template(scope));
      F('arcus-device-configurator-irrigation-mode').exists(() => done());
    });

    afterEach(function ae() {
      $('#test-area').empty();
    });

    it('selectable modes are grouped together', function group() {
      assert.equal(
        $('.radio-wrapper:not(.no-events)').length,
        2,
        'Manual and weekly',
      );
    });

    it('selects the right radio button on init', function init() {
      assert.equal($('li.radio-wrapper input:checked').val(), 'WEEKLY');
    });
  });
});
