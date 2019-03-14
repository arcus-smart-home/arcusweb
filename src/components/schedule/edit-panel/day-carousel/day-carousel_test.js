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

import { ViewModel } from './day-carousel';
import 'mocha/mocha';
import assert from 'chai';
import mockDate from 'mockdate';

describe('i2web/components/schedule/edit-panel/day-carousel', function favorite() {
  describe('main API', function mainApi() {
    let vm;
    const commandsByDay = {
      MON: [{
        days: ['FRI', 'WED', 'MON'],
        time: '8:00:00',
        scheduleId: 'TEST',
      }],
      TUE: [{
        days: ['TUE', 'FRI'],
        time: '14:00:00',
        scheduleId: 'TEST',
      }],
    };

    beforeEach(function beforeEach() {
      // set the mock date to a Monday
      mockDate.set('2/20/2017');
      vm = new ViewModel({
        commands: commandsByDay,
      });
    });

    afterEach(function afterEach() {
      mockDate.reset();
    });

    it('should set selected day correctly when there are no commands if not Sunday', function test() {
      vm.attr('commands', []);
      assert.equal(vm.attr('selectedDay'), 0);
      assert.equal(vm.attr('weekdayAbbr'), 'MON');
      assert.equal(vm.attr('weekdayDisplayed'), 'Monday');
    });
    it('should set selected day correctly when there are no commands if Sunday', function test() {
      // set date to Sunday - should reset selected day to 6
      mockDate.set('2/26/2017');
      vm.attr('commands', []);
      assert.equal(vm.attr('selectedDay'), 6);
      assert.equal(vm.attr('weekdayAbbr'), 'SUN');
      assert.equal(vm.attr('weekdayDisplayed'), 'Sunday');
    });
    it('should set selected day correctly when there are commands', function test() {
      assert.equal(vm.attr('selectedDay'), 0);
      assert.equal(vm.attr('weekdayAbbr'), 'MON');
      assert.equal(vm.attr('weekdayDisplayed'), 'Monday');
    });
    it('should switch day commands on next() and prev()', function test() {
      assert.deepEqual(vm.attr('dayCommands').serialize(), commandsByDay.MON);
      vm.next();
      assert.deepEqual(vm.attr('dayCommands').serialize(), commandsByDay.TUE);
      vm.prev();
      assert.deepEqual(vm.attr('dayCommands').serialize(), commandsByDay.MON);
    });
    it('should show formatted time with timeA', function test() {
      assert.equal(vm.timeA('15:00:00'), '03:00 PM');
    });
    it('should show days with daysDisplay', function test() {
      assert.deepEqual(vm.daysDisplay(['monday', 'TUE']), 'Mon, Tue');
    });
    it('should indicate a new event', function testNewEvent() {
      assert.equal(vm.attr('hasNewEvent'), false, 'No new at first');

      // A trick: we need to bind to `dayCommands` otherwise its getter will be evaluated every time
      // and we will be getting a different canMap every time (from inside `hasNewEvent`).
      vm.on('dayCommands', function bindToDayCommands() { });
      vm.attr('event', vm.attr('dayCommands.0'));
      assert.equal(vm.attr('hasNewEvent'), false, 'No new event on selected an existing');

      vm.attr('event', {});
      assert.equal(vm.attr('hasNewEvent'), true, 'True on a new event');
    });
  });

  describe('internal utils', function internalUtils() {
    it('should sort days with sortDays', function testSortDays() {
      const list = ['FRI', 'MON', 'WED', 'TUE'];
      assert.deepEqual(list.sort(ViewModel.sortDays), ['MON', 'TUE', 'WED', 'FRI']);
    });
    it('should sort events with sortEvents', function testSortEvents() {
      const list = [
        { id: 6, mode: 'ABSOLUTE', time: '14:00:00' },
        { id: 4, mode: 'SUNSET', offsetMinutes: 20 },
        { id: 3, mode: 'SUNSET', offsetMinutes: 10 },
        { id: 2, mode: 'SUNRISE', offsetMinutes: 5 },
        { id: 1, mode: 'SUNRISE', offsetMinutes: -10 },
        { id: 5, mode: 'ABSOLUTE', time: '08:00:00' },
      ];
      assert.deepEqual(list.sort(ViewModel.sortEvents).map(a => a.id), [1, 2, 3, 4, 5, 6]);
    });

    describe('dayOfFirstEvent', function dayOfFirstEventFN() {
      it('should return today index if today has events', function returnToday() {
        const dayOfFirstEvent = ViewModel.dayOfFirstEvent;
        const today = 2; // WED
        const commands = {
          MON: [],
          TUE: [],
          WED: [{}], // give WED a length greater than 0
          THU: [],
          FRI: [],
          SAT: [],
          SUN: [],
        };
        assert.equal(dayOfFirstEvent(today, commands), 2);
      });

      it('should return index greater than today if later in the week', function laterInWeek() {
        const dayOfFirstEvent = ViewModel.dayOfFirstEvent;
        const today = 2; // WED
        const commands = {
          MON: [],
          TUE: [],
          WED: [],
          THU: [],
          FRI: [],
          SAT: [{}], // give SAT a length greater than 0
          SUN: [],
        };
        assert.equal(dayOfFirstEvent(today, commands), 5);
      });

      it('should return index less than today if earlier in the week', function earlierInWeek() {
        const dayOfFirstEvent = ViewModel.dayOfFirstEvent;
        const today = 2; // WED
        const commands = {
          MON: [{}], // give MON a length greater than 0
          TUE: [],
          WED: [],
          THU: [],
          FRI: [],
          SAT: [],
          SUN: [],
        };
        assert.equal(dayOfFirstEvent(today, commands), 0);
      });
    });
  });
});
