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

import moment from 'moment';
import 'moment-timezone';
import tz from 'jstz';
import AppState from 'i2web/plugins/get-app-state';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * @function adjustEventTimezones
 * @param {String} fromTZ the name of the timezone we are starting in
 * @param {String} toTZ the name of the timezone we are converting to
 * @param {Array<String>} days An array of string names the event occurs on
 * @param {String} time The time the event occurs in the format HH:mm:00
 * @parent i2web/components/schedule/from-to-timezone
 * Adjusts the days and time the event is schedule by the Place's local timezone
 */
export function adjustEventTimezones(fromTZ, toTZ, time, days) {
  const [hours, minutes] = time.split(':');
  const fromTime = moment.tz(fromTZ).hours(hours).minutes(minutes);
  const toTime = fromTime.clone().tz(toTZ);
  if (days) {
    const dayDiff = -(fromTime.day() - toTime.day());
    const toDays = days.map((day) => {
      const index = DAYS.indexOf(day);
      const toIndex = index + dayDiff;
      return DAYS[(toIndex < 0 ? toIndex + 7 : toIndex) % 7];
    });
    return [toDays, toTime.format('HH:mm:00')];
  }
  return [days, toTime.format('HH:mm:00')];
}

/**
 * @function fromDeviceToPlaceTimezone
 * @param {String} time The time the event occurs in the format HH:mm:00
 * @param {Array<String>} days An array of string names the event occurs on
 * @parent i2web/components/schedule/from-to-timezone
 * Adjust an event day and time from device TZ to place TZ
 */
export function fromDeviceToPlaceTimezone(time, days) {
  const placeTZ = AppState().attr('place.place:tzId');
  const deviceTZ = tz.determine().name();
  if (placeTZ) {
    return adjustEventTimezones(deviceTZ, placeTZ, time, days);
  }

  return [days, time];
}

/**
 * @function fromPlaceToDeviceTimezone
 * @param {Array<String>} days An array of string names the event occurs on
 * @param {String} time The time the event occurs in the format HH:mm:00
 * @parent i2web/components/schedule/from-to-timezone
 * Adjust an event day and time from place TZ to device TZ
 */
export function fromPlaceToDeviceTimezone(time, days) {
  const placeTZ = AppState().attr('place.place:tzId');
  const deviceTZ = tz.determine().name();
  if (placeTZ) {
    return adjustEventTimezones(placeTZ, deviceTZ, time, days);
  }

  return [days, time];
}

export default {
  adjustEventTimezones,
  fromDeviceToPlaceTimezone,
  fromPlaceToDeviceTimezone,
};
