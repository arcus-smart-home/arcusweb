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
import canMap from 'can-map';
import 'can-map-define';
import view from './calendar.stache';
import moment from 'moment';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Object} configuration
     * @parent i2web/components/schedule/calendar
     * @description The scheduler configuration object specific to the type of 'thing'
     */
    configuration: {
      type: '*',
    },
    /**
     * @property {CanMap} events
     * @parent i2web/components/schedule/calendar
     * @description Events (commands) for this scheduler
     */
    events: {
      Type: canMap,
    },
    /**
     * @property {CanMap} filteredEvents
     * @parent i2web/components/schedule/calendar
     * @description Events (commands) for this scheduler, filtered by scheduleId if a
     * mode is provided
     */
    filteredEvents: {
      get() {
        const events = this.attr('events');
        if (!events) return new canMap([]);

        const mode = this.attr('mode');
        if (!mode) {
          return events;
        }

        const filteredEvents = new canMap(events.attr());
        filteredEvents.each((eventList) => {
          eventList.replace(eventList.filter((event) => {
            return event.attr('scheduleId') === mode;
          }));
        });
        return filteredEvents;
      },
    },
    /**
     * @property {string} mode
     * @parent i2web/components/schedule/calendar
     * @description A mode by which to filter our schedule by. This might be a device mode
     * such as on thermostats.
     */
    mode: {
      type: 'string',
    },
  },
});

export default Component.extend({
  tag: 'arcus-schedule-calendar',
  viewModel: ViewModel,
  view,
  helpers: {
    /**
     * @function displayTimeLabel
     * @parent i2web/components/time-scale
     * @param {Number} hour The hour, either 6 or 12.
     *
     * @description
     * Display the time for a particular 'tick'.
     *
     * @return {String} The formatted li.time-label to display (6 A, 12 P, 6 P)
     */
    displayTimeLabel(hour) {
      let parts = [];
      const format = moment().hour(hour).format('h A');
      parts = format.split(' ');
      return `${parts[0]} ${parts[1].slice(0, 1)}`;
    },
  },
});
