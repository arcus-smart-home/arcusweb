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

import Component from 'can-component';
import CanMap from 'can-map';
import CanList from 'can-list';
import 'can-map-define';
import moment from 'moment';
import view from './day-carousel.stache';

const WEEK_DAYS = {
  abbr: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  full: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

const capitalize = str => (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase());

const capTrunc = len => str => capitalize(str).substring(0, len || str.length);

/**
 * @function dayOfFirstEvent
 * @param {CanMap} commands A map of commands of the scheduler.
 * @description Find the index of the first day that events occur on.
 */
const dayOfFirstEvent = (today, commands) => {
  const orderedCommands = [];
  Object.keys(commands).forEach((commandKey) => {
    const commandIndex = WEEK_DAYS.abbr.indexOf(commandKey);
    if (commandIndex > -1) {
      orderedCommands[commandIndex] = commands[commandKey];
    }
  });
  // today or after
  for (let i = today; i < orderedCommands.length; i++) {
    if (orderedCommands[i].length) return i;
  }
  // before today
  const beforeToday = orderedCommands.slice(0, today).findIndex(cmds => cmds.length > 0);
  if (beforeToday >= 0) return beforeToday;
  return today;
};

const sortTime = ([h, m, s]) => moment()
  .hour(h).minute(m).second(s)
  .format('HH:mm:ss');

const sortDays = (a, b) => (WEEK_DAYS.abbr.indexOf(a) < WEEK_DAYS.abbr.indexOf(b) ? -1 : 1);

const sortEvents = (a, b) => {
  if (a.mode !== 'ABSOLUTE' && b.mode === 'ABSOLUTE') return -1;
  if (b.mode !== 'ABSOLUTE' && a.mode === 'ABSOLUTE') return 1;
  if (a.mode === 'ABSOLUTE' && b.mode === 'ABSOLUTE') return sortTime(a.time.split(':')) < sortTime(b.time.split(':')) ? -1 : 1;
  if (a.mode === 'SUNRISE' && b.mode === 'SUNSET') return -1;
  if (b.mode === 'SUNRISE' && a.mode === 'SUNSET') return 1;

  // Irrigation controllers
  const modes = ['WEEKLY', 'INTERVAL', 'ODD', 'EVEN'];
  if (modes.includes(a.mode) && modes.includes(b.mode)) {
    const [ah, am, as] = a.time.split(':');
    const [bh, bm, bs] = b.time.split(':');
    const aTime = moment().hour(ah).minute(am).second(as);
    const bTime = moment().hour(bh).minute(bm).second(bs);
    return (aTime.isBefore(bTime)) ? -1 : 1;
  }
  return a.offsetMinutes < b.offsetMinutes ? -1 : 1;
};
const timeA = ([h, m, s]) => moment()
  .hour(h).minute(m).second(s)
  .format('hh:mm A');

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {CanMap} commands A map of commands of the scheduler.
     * @parent i2web/components/schedule/edit-panel/day-carousel
     */
    commands: {
      Type: CanMap,
      set(commands) {
        // normalize "today" to correspond with WEEK_DAYS
        // Mon = 0, Sun = 7. Moment.day() uses 0 = Sun, 1 = Mon, etc, so subtract one from that value.
        // If the value is -1 (Sun), reset it to 6.
        let today = moment().day() - 1;
        if (today < 0) today = 6;
        this.attr('selectedDay', dayOfFirstEvent(today, commands));
        return commands;
      },
    },
    /**
     * @property {CanList} commands A list of commands for the selected day.
     * @parent i2web/components/schedule/edit-panel/day-carousel
     */
    dayCommands: {
      get() {
        const dayCommands = this.attr(`commands.${WEEK_DAYS.abbr[this.attr('selectedDay')]}`);
        const commands = (dayCommands) ? dayCommands.serialize() : new CanList([]);
        const mode = this.attr('mode');

        if (!mode) {
          return new CanList(commands.sort(sortEvents));
        }

        return new CanList(commands.filter((command) => {
          return command.scheduleId === mode;
        }).sort(sortEvents));
      },
    },
    /**
     * @property {Boolean} hasNewEvent Indicates if there is an event and its not found among existing commands.
     * @parent i2web/components/schedule/edit-panel/day-carousel
     */
    hasNewEvent: {
      get() {
        const event = this.attr('event');
        if (event && event.attr('scheduleId')) {
          return ![].reduce.call(this.attr('dayCommands'), (r, c) => (r || c === event), false);
        }
        if (event && !event.attr('eventId')) {
          return true;
        }
        return false;
      },
    },
    /**
     * @property {Number} selectedDay A number (0-6) of a week day selected in carousel.
     * @parent i2web/components/schedule/edit-panel/day-carousel
     */
    selectedDay: {
      set(val) {
        return (val < 0 ? val + 7 : val) % 7;
      },
    },
    /**
     * @property {Boolean} showDayHeader
     * @parent i2web/components/schedule/edit-panel/day-carousel
     * @description Do not show the header when we have an irrigatin controller
     * in INTERVAL, EVEN, or ODD mode
     */
    showDayHeader: {
      get() {
        const mode = this.attr('mode');
        if (!mode) return true;

        const dontShowFor = ['INTERVAL', 'EVEN', 'ODD'];
        return !dontShowFor.includes(mode);
      },
    },
    /**
     * @property {String} weekdayAbbr
     * @parent i2web/components/schedule/edit-panel/day-carousel
     * @description The abbreviation for the day of the week displayed in the carousel
     */
    weekdayAbbr: {
      get() {
        return WEEK_DAYS.abbr[this.attr('selectedDay')];
      },
    },
    /**
     * @property {String} weekdayDisplayed
     * @parent i2web/components/schedule/edit-panel/day-carousel
     * @description The day of the week displayed in the carousel
     */
    weekdayDisplayed: {
      get() {
        return WEEK_DAYS.full[this.attr('selectedDay')];
      },
    },
  },
  /**
   * @function {Boolean} absoluteTimeMode
   * @parent i2web/components/schedule/edit-panel/day-carousel
   * @param {Object} command
   * @description Whether the mode of a given scheduled command should
   * be displayed in absolute or relative time mode
   */
  absoluteTimeMode(command) {
    const modes = ['ABSOLUTE', 'EVEN', 'INTERVAL', 'ODD', 'WEEKLY'];
    return modes.includes(command.mode);
  },
  /**
   * @function daysDisplay Concats days of an event into a string of sorted (chronologically) and comma-separated days.
   * @parent i2web/components/schedule/edit-panel/day-carousel
   * @param {Array | CanList} list
   * @return {Array}
   */
  daysDisplay(list) {
    const arr = list && list.serialize ? list.serialize() : (list || []);
    return arr.sort(sortDays).map(capTrunc(3)).join(', ');
  },
  /**
   * @function {Boolean} irrigationEvent
   * @param {Object} command The scheduled event
   * @parent i2web/components/schedule/edit-panel/day-carousel
   * @description Whether the event is an irrigation event
   */
  irrigationEvent(command) {
    const modes = ['EVEN', 'INTERVAL', 'ODD', 'WEEKLY'];
    return modes.includes(command.mode);
  },
  /**
   * @function {String} irrigationZoneCountText
   * @param {Object} command
   * @parent i2web/components/schedule/edit-panel/day-carousel
   * @description The text for the number of zones scheduled for an event
   */
  irrigationZoneCountText(command) {
    const count = command.events.length;
    return `${count} ${(count > 1) ? 'Zones' : 'Zone'}`;
  },
  /**
   * @function {Array} irrigationZoneListText
   * @param {Object} command
   * @parent i2web/components/schedule/edit-panel/day-carousel
   * @description The list of zones schedules: ZoneX[, ZoneY, [& N more]]
   */
  irrigationZoneListText(command) {
    const moreThanTwo = command.events.length > 2;
    const events = (moreThanTwo) ? command.events.slice(0, 2) : command.events;
    const names = events.map((event) => {
      const name = this.attr(`thing.irr:zonename:${event.zone}`);
      return name || `Zone ${event.zone.slice(1)}`;
    }).join(', ');
    return (moreThanTwo)
      ? `${names} & ${command.events.length - 2} more`
      : names;
  },
  /**
   * @function {Boolean} isActive
   * @param {Object} command
   * @parent i2web/components/schedule/edit-panel/day-carousel
   * @description Is the User editing the specific command?
   */
  isActive(command) {
    return this.attr('event') === command
      // irrigation events
      || this.attr('event.eventId') === command.attr('id');
  },
  /**
   * @function timeA Formats time of a command.
   * @parent i2web/components/schedule/edit-panel/day-carousel
   * @param {String} time A string with time, e.g. "8:00:00"
   * @return {String} Formatted time with AM/PM.
   */
  timeA(time) {
    return timeA(time.split(':'));
  },
  /**
   * @function next Scrolls to the next day of the week.
   * @parent i2web/components/schedule/edit-panel/day-carousel
   */
  next() {
    if (this.attr('event')) return;
    this.attr('selectedDay', this.attr('selectedDay') + 1);
  },
  /**
   * @function next Scrolls to the previous day of the week.
   * @parent i2web/components/schedule/edit-panel/day-carousel
   */
  prev() {
    if (this.attr('event')) return;
    this.attr('selectedDay', this.attr('selectedDay') - 1);
  },
  /**
   * @function editEvent Selects an event to edit.
   * @parent i2web/components/schedule/edit-panel/day-carousel
   */
  editEvent(event) {
    if (this.attr('event')) return;
    if (this.irrigationEvent(event)) {
      const editing = {
        controller: event.events[0].controller,
        days: event.days,
        eventId: event.id,
        intervalDuration: this.attr('intervalDuration'),
        mode: event.mode,
        timeOfDay: event.time,
        zoneDurations: event.events.serialize().map((e) => {
          return {
            duration: e.duration,
            zone: e.zone,
          };
        }),
      };
      this.attr('event', editing);
    } else {
      this.attr('event', event);
    }
  },
  /**
   * @function relativeTimeOf The time the event is scheduled to run relative to sunrise or sunset.
   * @parent i2web/components/schedule/edit-panel/day-carousel
   * @param {Object} command
   * @return {String}
   */
  relativeTimeOf(command) {
    let offset = null;
    if (command.offsetMinutes < 0) {
      offset = `${Math.abs(command.offsetMinutes)} Min Before`;
    }
    if (command.offsetMinutes > 0) {
      offset = `${command.offsetMinutes} Min After`;
    }
    const when = (command.mode === 'SUNRISE') ? 'Sunrise' : 'Sunset';
    return `
      ${offset ? `${offset} ${when}` : `At ${when}`}
      <i class="icon-app-${when.toLowerCase()}"></i>
      <span class="sr-only when">${when}</span>
    `;
  },
});

ViewModel.dayOfFirstEvent = dayOfFirstEvent;
ViewModel.sortDays = sortDays;
ViewModel.sortEvents = sortEvents;

export default Component.extend({
  tag: 'arcus-day-carousel',
  viewModel: ViewModel,
  view,
});
