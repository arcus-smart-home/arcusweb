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
import Component from 'can-component';
import canMap from 'can-map';
import canList from 'can-list';
import 'can-map-define';
import view from './history.stache';
import moment from 'moment/';

import Analytics from 'i2web/plugins/analytics';
import { formatDate, formatTime } from 'i2web/helpers/global';
import Errors from 'i2web/plugins/errors';
import { Source } from 'i2web/components/infinite-scroll/infinite-scroll';
import Device from 'i2web/models/device';
import Place from 'i2web/models/place';

const PREMIUM_HISTORY_RANGE = 14;

const HistorySource = Source.extend({
  render(prevItem, item, element) {
    const thisDate = formatDate(item.timestamp);
    const prevDate = prevItem ? formatDate(prevItem.timestamp) : '';
    if (thisDate !== prevDate) {
      element.querySelector('.date').classList.remove('hidden');
      element.querySelector('.date h3').textContent = formatDate(item.timestamp);
      // If the previous date doesn't exist, we want to hide the date no matter what.
      if (prevDate === '') {
        element.querySelector('.date').classList.add('hidden');
      }
    } else {
      element.querySelector('.date').classList.add('hidden');
      element.querySelector('.date h3').textContent = '';
    }
    element.dataset.date = thisDate;
    element.querySelector('.time').textContent = formatTime(item.timestamp);
    element.querySelector('.event .event-description p').textContent = item.subjectName;
    element.querySelector('.event small').textContent = item.longMessage;

    return element;
  },

  fetch(count) {
    if (!this._fetches) {
      this._fetches = [];
    }

    const eventToken = this.attr('eventToken');
    const earliestEvent = this.attr('earliestEvent');
    const limit = Math.min(this.attr('limit'), count);
    const eventSubject = this.attr('eventSubject');

    // Fetching history data requires two bits of information, it needs the number
    // of items we are going to fetch, as well as a token that is the starting
    // point where we start fetching history data. Since this function will
    // attempt to fetch infinitely, we need to wait to resolve the promise until
    // we have the previous attempt's token.
    return new Promise((resolve, reject) => {
      let nextTokenResolve;
      // Create a new promise, for this request's nextToken, we pull it's resolve
      // outside in order to resolve it in another Promise.
      const nextTokenPromise = new Promise((tokenResolve) => {
        nextTokenResolve = tokenResolve;
      });

      // Grab either the oldest token promise, or if one doesn't exist, one that
      // is resolved with the eventToken.
      const fetch = this._fetches.pop() || Promise.resolve(eventToken);

      // Push the nextToken promise into our fetches.
      this._fetches.push(nextTokenPromise);

      fetch.then((token) => {
        // token resolves to null if there are no more items to be fetched, if
        // token is null, we should resolve with an empty array.
        if (token === null) {
          this._fetches.pop();
          resolve([]);
        }

        // Fetch next set of data
        eventSubject.ListHistoryEntries(limit, token).then((results) => {
          // Discontinue event queries once we cross the
          // earliest event threshold
          const nextToken = earliestEvent > results.nextToken
            ? null
            : results.nextToken;

          // Resolve the nextToken promise with the nextToken
          nextTokenResolve(nextToken);

          // Eliminate all results older than earliest date allowed
          _.remove(results.results, function removeOldest(item) {
            return item.timestamp < earliestEvent;
          });

          // resolve our promise with results.
          resolve(results.results);
        }).catch((e) => {
          Errors.log(e, true);
          reject(e);
        });
      }).catch((e) => {
        Errors.log(e);
        reject(e);
      });
    });
  },
});

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Place} place
     * @parent i2web/pages/history
     *
     * Place for which history events are being displayed.
     */
    place: {
      Type: Place,
      set(newPlace) {
        if (newPlace) {
          this.attr('earliestEvent', (newPlace.attr('isPremium')
            ? moment().subtract(PREMIUM_HISTORY_RANGE * 24, 'hours').valueOf()
            : moment().subtract(24, 'hours').valueOf()));
        }
        return newPlace;
      },
    },
    /**
     * @property {Number} limit
     * @parent i2web/pages/history
     *
     * The history event fetch limit; constrains the number of
     * events retrieved at a time from the platform.
     */
    limit: {
      type: 'number',
      value: 10,
    },
    /**
     * @property {Number} earliestEvent
     * @parent i2web/pages/history
     *
     * The earliest threshold for which events are displayed; will
     * be start of day for Basic accounts and 14 days ago for Premium.
     */
    earliestEvent: {
      type: 'number',
      value: 0,
    },
     /**
     * @property {canList} devices
     * @parent i2web/pages/history
     *
     * List of devices for the current place; used to populate
     * the device filter dropdown.
     */
    devices: {
      Type: Device.List,
      set(newDevices) {
        return newDevices;
      },
    },
    /**
     * @property {Device.List} eventDates
     * @parent i2web/pages/history
     *
     * List of dates to be presented in Date filter, which is only shown
     * if the current Place has Premium service.
     */
    eventDates: {
      Type: canList,
      get() {
        const dates = new canList([]);
        const currentDay = moment().endOf('day');
        dates.push(currentDay.valueOf());
        for (let i = 1; i <= PREMIUM_HISTORY_RANGE; i++) {
          dates.push(currentDay.subtract(1, 'day').valueOf());
        }
        return dates;
      },
    },
    /**
     * @property {string} checkedRadio
     * @parent i2web/pages/history
     *
     * Holds a string representing the currently selected filter
     * radio button.
     */
    checkedRadio: {
      type: 'string',
      value: 'clear',
    },
    /**
     * @property {canMap} eventFilter
     * @parent i2web/pages/history
     *
     * Represents current filter criteria, including the subject
     * of the query (place or device) and the starting timestamp.
     */
    eventFilter: {
      type: '*',
      set(newFilter) {
        return newFilter;
      },
    },
    /**
     * @property {Device} historySource
     * @parent i2web/pages/history
     *
     * Provides proper history context for infinite scrolling list
     * based on filter settings.
     */
    historySource: {
      Type: HistorySource,
      get(lastSetValue, setAttrValue) {
        const place = this.attr('place');
        const limit = this.attr('limit');
        const eventFilter = this.attr('eventFilter');
        const eventToken = eventFilter ? eventFilter.token : undefined;
        const earliestEvent = this.attr('earliestEvent');
        const eventSubject = eventFilter ? eventFilter.subject : place;
        if (eventSubject) {
          // Reset for each new query
          setAttrValue(new HistorySource({
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
            eventToken,
            earliestEvent,
            limit,
            eventSubject,
          }));
        }
      },
    },
    /**
     * @function day
     * @parent i2web/pages/history
     *
     * Updates filter criteria and retrieves appropriate history events for the
     * selected day.
     */
    day: {
      set(selected) {
        if (selected === '') {
          return selected;
        }
        this.attr('checkedRadio', 'day');
        this.attr('eventFilter', { token: selected, subject: this.attr('place') });
        return selected;
      },
    },
    /**
     * @function device
     * @parent i2web/pages/history
     *
     * Updates filter criteria and retrieves appropriate history events for the
     * selected device.
     */
    device: {
      set(selected) {
        if (selected === '') {
          return selected;
        }
        this.attr('checkedRadio', 'device');
        const device = _.find(this.attr('devices'), ['base:id', selected]);
        if (device) {
          this.attr('eventFilter', { token: undefined, subject: device });
        } else {
          this.attr('eventFilter', { token: undefined, subject: this.attr('place') });
        }
        return selected;
      },
    },
    clear: {
      type: 'string',
      set(selected) {
        this.attr('checkedRadio', 'clear');
        this.attr('eventFilter', { token: undefined, subject: this.attr('place') });
        return selected;
      },
    },
  },
  /**
   * @function checkRadio
   * @parent i2web/pages/history
   *
   * Sets the checkedRadio filter property to the value associated with the radio button
   * being selected and updates the event listing if a specific object was preselected.
   */
  checkRadio(radio) {
    const currentRadio = this.attr('checkedRadio');
    if (radio !== currentRadio) {
      this.tagAction(radio);
      this.attr('checkedRadio', radio);
      const value = this.attr(radio);
      if (value !== '') {
        this.attr(radio, value);
      }
    }
  },
  /**
   * @function refreshHistory
   * @parent i2web/pages/history
   *
   * When the User clicks the 'Refresh History' icon, creates and sets a new
   * HistorySource with the same parameters of the previous HistorySource.
   */
  refreshHistory() {
    this.attr('historySource', new HistorySource(this.attr('historySource').attr()));
  },
  /**
   * @function tagAction
   * @parent i2web/pages/history
   * Add analytics tags when user clicks on day / device filtering.
   */
  tagAction(action) {
    if (action === 'day') {
      Analytics.tag('history.filter.day');
    } else if (action === 'device') {
      Analytics.tag('history.filter.device');
    }
  },
});

export default Component.extend({
  tag: 'arcus-page-history',
  viewModel: ViewModel,
  view,
});
