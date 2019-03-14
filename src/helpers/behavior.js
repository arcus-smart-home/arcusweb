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
import stache from 'can-stache';
import { formatTemp } from 'i2web/helpers/global';
import moment from 'moment';
import 'moment-timezone';
import tz from 'jstz';

export const formatDevicesStatus = function formatDevicesStatus(behavior, availableDevices, defaultValue) {
  // only count devices also in availableDevices due to platform bug https://eyeris.atlassian.net/browse/I2-746
  const devicesCanList = behavior.attr('devices');
  const devices = _.intersection(
    devicesCanList ? devicesCanList.attr() : [],
    availableDevices.attr(),
  );
  const numDevices = devices && devices.length;
  return numDevices
    ? `${numDevices} Device${numDevices > 1 ? 's' : ''}`
    : defaultValue;
};
export const formatDevicesOpenStatus = function formatDevicesOpenStatus(behavior, availableDevices, defaultValue) {
  // only count devices also in availableDevices due to platform bug https://eyeris.atlassian.net/browse/I2-746
  const openCountMap = behavior.attr('openCount');
  const openCount = openCountMap ? openCountMap.attr() : {};
  const devices = _.intersection(_.keys(openCount), availableDevices.attr());
  const numDevices = devices && devices.length;
  return numDevices
    ? `${numDevices} Device${numDevices > 1 ? 's' : ''}`
    : defaultValue;
};
export const formatDurationStatus = function formatDurationStatus(behavior, unit, defaultValue) {
  const durationSecs = behavior.attr('durationSecs');
  if (durationSecs) {
    let units = _.capitalize(unit || 'Seconds');
    let duration = moment.duration(durationSecs, 'seconds');
    if (units === 'Days') {
      duration = duration.asDays();
    } else if (units === 'Hours' || durationSecs >= 3600) {
      duration = duration.asHours();
      units = 'Hours';
    } else if (units === 'Minutes') {
      duration = duration.asMinutes();
    }
    units = ({ Seconds: 'Secs', Minutes: 'Mins', Hours: 'Hours' }[units]) || units;
    return `${duration} ${duration > 1 ? units : _.trimEnd(units, 's')}`;
  }
  return defaultValue;
};
export const formatTemperatureRangeStatus = function formatTemperatureRangeStatus(behavior, defaultValue) {
  const low = behavior.attr('lowTemp');
  const high = behavior.attr('highTemp');
  if (typeof low === 'undefined' || low === null
    || typeof high === 'undefined' || high === null) { return defaultValue; }
  return `${formatTemp(low)}&deg; - ${formatTemp(high)}&deg;`;
};
export const formatConvertedTime = function formatConvertedTime(sourceTime, sourceTzId, destTzId, format) {
  const sourceTimestamp = moment.tz(`${moment().format('YYYY-MM-DD')} ${sourceTime}`, sourceTzId);
  return moment.tz(sourceTimestamp, destTzId).format(format);
};
export const formatTimeStatus = function formatTimeStatus(behavior, tzId, format, defaultValue) {
  const curfewTime = behavior.attr('presenceRequiredTime');
  if (curfewTime) {
    return formatConvertedTime(curfewTime, tzId, tz.determine().name(), format);
  }
  return defaultValue;
};

export const formatTimeWindowsStatus = function formatTimeWindowsStatus(behavior, defaultValue) {
  const w = behavior.attr('timeWindows') && behavior.attr('timeWindows.length');
  return w ? `${w} Event${w > 1 ? 's' : ''}` : defaultValue;
};

stache.registerSimpleHelper('format-converted-time', formatConvertedTime);
stache.registerSimpleHelper('format-devices-status', formatDevicesStatus);
stache.registerSimpleHelper('format-devices-open-status', formatDevicesOpenStatus);
stache.registerSimpleHelper('format-duration-status', formatDurationStatus);
stache.registerSimpleHelper('format-temperature-range-status', formatTemperatureRangeStatus);
stache.registerSimpleHelper('format-time-status', formatTimeStatus);
stache.registerSimpleHelper('format-time-windows-status', formatTimeWindowsStatus);
