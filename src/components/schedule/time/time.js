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
import view from './time.stache';

/**
 * @module i2web/components/schedule/time
 * @parent i2web/components/schedule
 */

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {String} time String time, e.g. "08:15:00".
     */
    time: {
      type: 'string',
    },
    /**
     * @property {canMap} parsedTime Parsed time string
     */
    parsedTime: {
      get() {
        // extract the time pieces from the event time
        const [, hour, tens, ones] = /([-\d]{1,2}):(\d)(\d)/gi.exec(this.attr('time')).map(a => parseInt(a, 10));
        let adjustedHour = hour;

        if (hour > 12) {
          adjustedHour = (hour - 12);
        } else if (hour === 0 || hour === -1) {
          adjustedHour = 12;
        }
        return new canMap({
          hour: adjustedHour,
          tens,
          ones,
          isPM: hour >= 12,
        });
      },
    },
    /**
     * @property {Number} hour
     * @parent i2web/components/schedule/time
     * @description Hour being scheduled
     */
    hour: {
      type: 'number',
      set(newVal) {
        this.attr('time', this.makeTimeString({ hour: newVal }));
        return newVal;
      },
      get() {
        return this.attr('parsedTime.hour');
      },
    },
    /**
     * @property {Number} minuteTens
     * @parent i2web/components/schedule/time
     * @description Tens digit of minutes being scheduled
     */
    minuteTens: {
      type: 'number',
      set(newVal) {
        this.attr('time', this.makeTimeString({ tens: newVal }));
        return newVal;
      },
      get() {
        return this.attr('parsedTime.tens');
      },
    },
    /**
     * @property {Number} minuteOnes
     * @parent i2web/components/schedule/time
     * @description Ones digit of minutes being scheduled
     */
    minuteOnes: {
      type: 'number',
      set(newVal) {
        this.attr('time', this.makeTimeString({ ones: newVal }));
        return newVal;
      },
      get() {
        return this.attr('parsedTime.ones');
      },
    },
    /**
     * @property {Boolean} isPM
     * @parent i2web/components/schedule/time
     * @description Whether the time is PM
     */
    isPM: {
      type: 'boolean',
      set(newVal) {
        this.attr('time', this.makeTimeString({ isPM: newVal }));
        return newVal;
      },
      get() {
        return this.attr('parsedTime.isPM');
      },
    },
    /**
     * @property {Boolean} editHours
     * @parent i2web/components/schedule/time
     * @description Whether the user should be able to edit the hours
     */
    editHours: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {Boolean} editMinutes
     * @parent i2web/components/schedule/time
     * @description Whether the user should be able to edit the minutes
     */
    editMinutes: {
      type: 'boolean',
      value: true,
    },
  },
  /**
   * @function makeTimeString
   * @parent i2web/components/schedule/time
   * converts the time parts into a string
   */
  makeTimeString({ hour = this.attr('hour'), tens = this.attr('minuteTens'), ones = this.attr('minuteOnes'), isPM = this.attr('isPM') }) {
    let hour24 = hour;
    if (isPM) {
      if (hour < 12) {
        hour24 = hour + 12;
      }
    } else if (hour === 12) {
      hour24 = 0;
    }
    if (hour24 < 10) hour24 = `0${hour24}`;
    return `${hour24}:${tens}${ones}:00`;
  },
  /**
   * @function togglePM
   * @parent i2web/components/schedule/time
   * Toggles between AM and PM
   */
  togglePM(ev, value) {
    ev.preventDefault();
    if (value === this.attr('isPM')) return;
    this.attr('isPM', value);
  },
});

export default Component.extend({
  tag: 'arcus-time',
  viewModel: ViewModel,
  view,
});
