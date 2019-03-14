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
import moment from 'moment';
import Component from 'can-component';
import canList from 'can-list';
import canMap from 'can-map';
import 'can-map-define';
import view from './day.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Object} configuration
     * @parent i2web/components/schedule/calendar/day
     * @description The scheduler configuration object specific to the type of 'thing'
     */
    configuration: {
      type: '*',
    },
    /**
     * @property {String} day
     * @parent i2web/components/calendar/day
     * @description The schedules day of the week
     */
    day: {
      type: 'string',
    },
    /**
     * @property {canList} events
     * @parent i2web/components/calendar/day
     * @description An object with a day property and a schedule property
     */
    events: {
      Type: canList,
    },
  },
  /**
   * @function isNotActive
   * @param {Object} event
   * @return {Boolean}
   * @description Whether or not to show the day of the event as inactive (an empty circle)
   */
  isNotActive(event) {
    if (this.attr('configuration')) {
      const inactiveWhen = this.attr('configuration').inactiveWhen;
      if (inactiveWhen) {
        return _.every(Object.keys(inactiveWhen), (property) => {
          return event.attr(property) === inactiveWhen[property];
        });
      }
    }
    return false;
  },
});

export default Component.extend({
  tag: 'arcus-schedule-calendar-day',
  viewModel: ViewModel,
  view,
  helpers: {
    /**
     * @function firstLetterOf
     * @param {String} day The day of the week to get the first letter of.
     * @return {String} The capitalized first letter of the day
     */
    firstLetterOf(day) {
      return day[0].toUpperCase();
    },
    positionOf(event) {
      const minutes = moment.duration(event.attr('time')).asMinutes();
      return minutes * (100 / (24 * 60)); // percentage per minute in 24 hours
    },
  },
});
