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
import 'can-map-define';
import view from './activity.stache';
import Subsystem from 'i2web/models/subsystem';
import getAppState from 'i2web/plugins/get-app-state';
import includes from 'lodash/includes';
import remove from 'lodash/remove';
import find from 'lodash/find';
import range from 'lodash/range';
import toArray from 'lodash/toArray';
import debounce from 'lodash/debounce';
import moment from 'moment';
import { formatDate, formatTime } from 'i2web/helpers/global';
import { Source } from 'i2web/components/infinite-scroll/infinite-scroll';

// number of days of history available to premium users
const PREMIUM_HISTORY_RANGE = 14;

// object that manages the updating infinite scroll elements & requeting of infinite scroll data
const ActivitySource = Source.extend({
  // update an element with new data
  render(prevItem = {}, data, el) {
    const formattedDate = formatDate(data.timestamp);
    const formattedTime = formatTime(data.timestamp);
    const dateEl = el.querySelector('.date');
    const dateHeaderEl = dateEl.querySelector('h3');

    // show header element when the day changes between two items
    if (!moment(prevItem.timestamp).isSame(data.timestamp, 'day')) {
      dateEl.classList.remove('hidden');
      dateHeaderEl.textContent = formattedDate;
    } else {
      dateEl.classList.add('hidden');
      dateHeaderEl.textContent = '';
    }

    // insert data into element
    el.dataset.date = formattedDate;
    el.dataset.headerString = 'Care Behavior Activity';
    el.querySelector('.time').textContent = formattedTime;
    el.querySelector('.event .event-description p').textContent = data.subjectName;
    el.querySelector('.event small').textContent = data.longMessage;

    return el;
  },
  // keep the token returned by the last request, this is the id of the next record in the history stream
  nextPositionToken: null,
  // note if we've fetched data that goes past the earliest time we want requested
  reachedDateLimit: false,
  // return a promise for certain number of records
  fetch(count) {
    const selectedDay = this.attr('selectedDay');
    const selectedDevices = this.attr('selectedDevices');
    const earliestTimestamp = this.attr('earliestTimestamp');
    const limit = Math.min(this.attr('limit'), count);
    const startPosition = this.nextPositionToken || selectedDay || undefined;
    const provider = this.attr('provider');
    const deviceIdList = selectedDevices ? toArray(selectedDevices).map(d => d['base:address']) : undefined;
    const returnEmpty = this.reachedDateLimit // return an empty array if there are no more items in range, or...
      || (deviceIdList && deviceIdList.length === 0) // ... when no devices are selected
      || selectedDay === null;  // ... when no day is selected

    if (returnEmpty) {
      return Promise.resolve([]);
    }

    // fetch next set of data
    return provider.ListDetailedActivity(limit, startPosition, deviceIdList).then((payload) => {
      this.nextPositionToken = payload.nextToken;

      // trim any results older than the earliest allowed time & note if any were trimmed
      this.reachedDateLimit = remove(payload.results, function removeOldest(item) {
        return item.timestamp < earliestTimestamp;
      }).length > 0;

      // trim any results not in the selected day
      if (selectedDay) {
        const selectedMoment = moment(selectedDay);
        remove(payload.results, a => !selectedMoment.isSame(a.timestamp, 'day'));
      }

      // return results to chained .then
      return payload.results;
    });
  },
});

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/care/activity
     * @description The associated subsystem, this should be a subsystem with the subcare capability
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {string} selectedDayString
     * @parent i2web/components/subsystem/care/activity
     * @description the value of the day selection dropdown
     */
    selectedDayString: {
      type: 'string',
      value: moment().startOf('day').valueOf().toString(),
    },
    /**
     * @property {number} selectedDay
     * @parent i2web/components/subsystem/care/activity
     * @description the day selected by the selection dropdown
     */
    selectedDay: {
      get() {
        const s = this.attr('selectedDayString');

        return (s && s.length)
          ? moment(parseInt(s, 10)).endOf('day').valueOf()
          : null;
      },
    },
    /**
     * @property {string} selectedDevicesString
     * @parent i2web/components/subsystem/care/activity
     * @description the value of the device selection dropdown, backed by the subsystem.subcare:careDevices array
     */
    selectedDevicesString: {
      type: 'string',
      get() {
        return this.attr('subsystem.subcare:careDevices').join(',');
      },
      set(value = '') {
        const subsystem = this.attr('subsystem');
        subsystem.attr('subcare:careDevices').replace(value.split(','));
      },
    },
    /**
     * @property {Array<Device>} selectedDevices
     * @parent i2web/components/subsystem/care/activity
     * @description the device models selected by the selection dropdown
     */
    selectedDevices: {
      get() {
        const devices = getAppState().attr('devices');
        const string = this.attr('selectedDevicesString') || '';
        return string.split(',').filter(s => s.length > 0)
          .map(i => find(devices, d => i === d.attr('base:address')));
      },
    },
    /**
     * @property {Array<Device>} allDevices
     * @parent i2web/components/subsystem/care/activity
     * @description all the device models in the care subsystem
     */
    allDevices: {
      get() {
        const devices = getAppState().attr('devices') || [];
        const careDeviceIds = this.attr('subsystem.subcare:careCapableDevices');

        return devices.filter((d) => {
          return includes(careDeviceIds, d.attr('base:address'));
        });
      },
    },
    /**
     * @property {boolean} isDeviceFiltering
     * @parent i2web/components/subsystem/care/activity
     * @description if device filtering is enabled
     */
    isDeviceFiltering: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} isNotDeviceFiltering
     * @parent i2web/components/subsystem/care/activity
     * @description the inverse of the value isDeviceFiltering, used to bind the 'All Devices' mutually exclusive checkbox
     */
    isNotDeviceFiltering: {
      type: 'boolean',
      get() {
        return !this.attr('isDeviceFiltering');
      },
      set(value) {
        this.attr('isDeviceFiltering', !value);
      },
    },
    /**
     * @property {boolean} enableFilterClear
     * @parent  i2web/components/subsystem/care/activity
     * @description if we enable the filter clearing button shown on the view
     */
    enableFilterClear: {
      type: 'boolean',
      get() {
        return this.attr('isDeviceFiltering') && (this.attr('selectedDevicesString').length > 0);
      },
    },
    /**
     * @property {number} earliestTimestamp
     * @parent i2web/components/subsystem/care/activity
     * @description the earliest time available to be fetched by this interface
     */
    earliestTimestamp: {
      type: 'number',
      get() {
        return getAppState().attr('place.isPremium')
          ? moment().subtract(PREMIUM_HISTORY_RANGE, 'days').valueOf()
          : moment().subtract(1, 'days').valueOf();
      },
    },
    /**
     * @property {number} refreshCount
     * @parent i2web/components/subsystem/care/activity
     * @description Count of user refresh requests. Used to trigger activity source recalculation.
     */
    refreshCount: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {Array<Object>} deviceList
     * @parent i2web/components/subsystem/care/activity
     * @description devices records available for selection in the dropdown
     */
    deviceList: {
      get() {
        return this.attr('allDevices').map((d) => {
          return { label: d['dev:name'], value: d['base:address'] };
        });
      },
    },
    /**
     * @property {Array<Object>} dayList
     * @parent i2web/components/subsystem/care/activity
     * @description day records available for selection in the dropdown
     */
    dayList: {
      get() {
        const isPremium = getAppState().attr('place.isPremium');
        const dayIndexRange = isPremium
          ? range(0, PREMIUM_HISTORY_RANGE)
          : range(0, 1);
        const moments = dayIndexRange.map((i) => {
          return moment().subtract(i, 'days').startOf('day');
        });

        return moments.map((m) => {
          return {
            value: m.valueOf(),
            label: formatDate(m),
          };
        });
      },
    },
    /**
     * @property {ActivitySource} activitySource
     * @parent i2web/components/subsystem/care/activity
     * @description the Source implementation that handles activity fetch requests
     */
    activitySource: {
      get(lastSetVal, asyncReturn) {
        this.attr('refreshCount'); // observe and recalc on refreshCount change
        const limit = 10;
        const subsystem = this.attr('subsystem');
        const isDeviceFiltering = this.attr('isDeviceFiltering');
        const selectedDevices = this.attr('selectedDevices');
        const allDevices = this.attr('allDevices');
        const selectedDay = this.attr('selectedDay') || undefined;
        const earliestTimestamp = this.attr('earliestTimestamp');
        const options = {
          template: `
            <li class="event-item row">
              <div class="col-xs date">
                <h3></h3>
              </div>
              <span class="time"></span>
              <div class="event col-xs">
                <div class="event-description">
                  <p></p>
                  <small></small>
                </div>
              </div>
            </li>`,
          earliestTimestamp,
          limit,
          selectedDay,
          selectedDevices: isDeviceFiltering ? selectedDevices : allDevices,
          provider: subsystem,
        };

        this.attr('debouncedActivitySourceInitializer')(options, asyncReturn);
      },
    },
    /**
     * @property {Function} debouncedActivitySourceInitializer
     * @parent i2web/components/subsystem/care/activity
     * @description return a function that will create an ActivitySource and pass it to a callback
     * 100ms after the last call to this function.
     */
    debouncedActivitySourceInitializer: {
      // generated in value function so instances don't share debouncing
      value() {
        return debounce(function debouncedInitializer(options, callback) {
          callback(new ActivitySource(options));
        }, 300);
      },
    },
  },
  // increment the refresh count, triggering a refresh
  refreshActivity() {
    this.attr('refreshCount', this.attr('refreshCount') + 1);
  },
  // clear out any selected device filter value
  clearDeviceFilter() {
    this.attr('isDeviceFiltering', false); // remove this once programmatic select updates work as intended
    this.attr('selectedDevicesString', '');
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-care-activity',
  viewModel: ViewModel,
  view,
  events: {
    // make the entire multiple dropdown label click-to-remove
    '.sidebar arcus-form-select .ui.multiple.dropdown .label click': function wholeLabelRemove(el) {
      el.querySelector('.delete').click();
    },
    '{viewModel} selectedDevicesString': function selectedDevicesUpdate() {
      this.viewModel.subsystem.save();
    },
  },
});
