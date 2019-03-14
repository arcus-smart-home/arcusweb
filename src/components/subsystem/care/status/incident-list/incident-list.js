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
import CanMap from 'can-map';
import 'can-map-define';
import Subsystem from 'i2web/models/subsystem';
import Errors from 'i2web/plugins/errors';
import view from './incident-list.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Boolean} loading
     * @parent i2web/components/subsystem/care/status/incident-list
     * @description Whether this component is still loading the care activity
     */
    loading: {
      value: false,
    },
    /**
     * @property {Array<Object>} history
     * @parent i2web/components/subsystem/care/status/incident-list
     * @description The care subsystem recent activity for this place
     */
    history: {
      type: '*',
    },
    /**
     * @property {Object} relevantActivityDays
     * @parent i2web/components/subsystem/care/status/incident-list
     * @description Generate an object with properties that are the epoch
     * of each day
     */
    relevantActivityDays: {
      get() {
        const today = moment().startOf('day');
        const days = {};
        for (let i = 0; i < 14; i++) {
          days[today.clone().subtract(i, 'day').valueOf()] = [];
        }
        return days;
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/care/status/incident-list
     * @description The associated subsystem, this should be a subsystem with the subcare capability
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  /**
   * @function {Array<String>} datesWithHistory
   * @parent i2web/components/subsystem/care/status/incident-list
   * @param {Object} entries
   * @description From the sorted list of history return an array of date strings
   */
  datesWithHistory(entries) {
    return (entries)
      ? Object.keys(entries).map(e => parseInt(e, 10)).sort().reverse()
      : [];
  },
  /**
   * @function {null|Array<Object>} getActivityForDate
   * @parent i2web/components/subsystem/care/status/incident-list
   * @param {String} date - The epoch for the start of the day
   * @description Get the Array of entries from the relavent day
   */
  getActivityForDate(date) {
    if (!this.attr('history')) return null;
    const entries = this.attr('history')[date];
    return (entries.length === 0) ? null : entries;
  },
  /**
   * @function {null|Array<Object>} getCareActivity
   * @parent i2web/components/subsystem/care/status/incident-list
   * @param {String} date - The epoch for the start of the day
   * @description Get the Array of entries from the relavent day
   */
  getCareActivity(nextToken) {
    this.attr('loading', true);
    this.attr('subsystem').ListHistoryEntries(100, nextToken, true).then((results) => {
      this.attr('loading', false);
      if (results.results.length === 0) {
        this.attr('history', null);
        return;
      }
      const activity = results.results;
      const twoWeeksAgo = moment().subtract(2, 'weeks');
      const inRange = activity.filter((result) => {
        return moment(result.timestamp).isAfter(twoWeeksAgo);
      });
      const groupedByDay = _.groupBy(inRange, (result) => {
        return moment(result.timestamp).startOf('day').valueOf();
      });
      const days = this.attr('relevantActivityDays');
      const currentHistory = this.attr('history') || {};
      const history = _.merge(days, currentHistory, groupedByDay);

      // https://eyeris.atlassian.net/browse/I2-3961
      // It is possible that a day could be split over more than one request
      // when this happens the _.merge above will simply concatenate the
      // events for a day, leaving them out of order. Interate through groupByDay
      // so that we don't sort all days each time, only the days retrieved per
      // request.
      Object.keys(groupedByDay).forEach((day) => {
        const events = history[day];
        if (events && events.length > 0) {
          history[day] = _.sortBy(events, ['timestamp']).reverse();
        }
      });

      this.attr('history', history);

      if (results.nextToken) {
        const lastTime = activity[activity.length - 1].timestamp;
        if (moment(lastTime).isAfter(twoWeeksAgo)) {
          this.getCareActivity(results.nextToken);
        }
      }
    }).catch((e) => {
      this.attr('loading', false);
      Errors.log(e);
    });
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-care-status-incident-list',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      this.viewModel.getCareActivity();
    },
  },
});
