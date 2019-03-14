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
import canMap from 'can-map';
import 'can-map-define';
import Analytics from 'i2web/plugins/analytics';
import Errors from 'i2web/plugins/errors';
import SidePanel from 'i2web/plugins/side-panel';
import IncidentCapability from 'i2web/models/capability/AlarmIncident';
import Place from 'i2web/models/place';
import Subsystem from 'i2web/models/subsystem';
import 'i2web/components/subsystem/alarms/status/incident-detail.component';
import view from './incident-list.stache';

const ANALYTICS_TAGS = {
  security: 'alarms.activity.filter.securitypanic',
  safety: 'alarms.activity.filter.smokeco',
  water: 'alarms.activity.filter.water',
};

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} activeFilter
     * @parent i2web/components/subsystem/alarms/status/generic
     * @description The currently selected filter (SECURITY, SMOKE, or WATER)
     */
    activeFilter: {
      type: 'string',
      value: 'security',
      set(filter) {
        const subsystem = this.attr(filter);
        if (subsystem) {
          this.removeAttr('history');
          this.getSubsystemIncidents(subsystem, null);
        }
        return filter;
      },
    },
    /**
     * @property {string} activeFilterText
     * @parent i2web/components/subsystem/alarms/status/generic
     * @description The text of the active filter (Security, Smoke/CO, Water Leak)
     */
    activeFilterText: {
      get() {
        const filter = this.attr('activeFilter');
        if (filter === 'security') return 'Security';
        if (filter === 'safety') return 'Smoke/CO';
        if (filter === 'water') return 'Water Leak';
        return '';
      },
    },
    /**
     * @property {boolean} loading
     * @parent i2web/components/subsystem/alarms/status/incident-list
     * @description Whether or not we are loading new history
     */
    loading: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Array<HistoryLog>} history
     * @parent i2web/components/subsystem/alarms/status/incident-list
     * @description Depending on the filtered selected, return the appropriate
     * list of history logs
     */
    history: {
      type: '*',
    },
    /**
     * @property {Number} howMuchHistory
     * @parent i2web/components/subsystem/alarms/status
     * @description How many days to go back when retrieving incidents
     */
    howMuchHistory: {
      get() {
        const today = moment();
        const goBackTo = (this.attr('place.isPremium'))
          ? today.clone().subtract(2, 'weeks')
          : today.clone().subtract(24, 'hours');
        return today.diff(goBackTo, 'days');
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/alarms/status
     * @description The current place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Object} relevantIncidentDays
     * @parent i2web/components/subsystem/alarms/status/incident-list
     * @description Generate an object with properties that are the epoch
     * of each day relevant to the level of service (PREMIUM/PROMON/BASIC)
     */
    relevantIncidentDays: {
      get() {
        const today = moment().startOf('day');
        const days = {};
        for (let i = 0; i <= this.attr('howMuchHistory'); i++) {
          days[today.clone().subtract(i, 'day').valueOf()] = [];
        }
        return days;
      },
    },
    /**
     * @property {Subsystem} safety
     * @parent i2web/components/subsystem/alarms/status/incident-list
     * @description The safety subsystem history log
     */
    safety: {
      Type: Subsystem,
      set(safety) {
        if (this.attr('activeFilter') === 'safety') {
          this.getSubsystemIncidents(safety, null);
        }
        return safety;
      },
    },
    /**
     * @property {Subsystem} security
     * @parent i2web/components/subsystem/alarms/status/incident-list
     * @description The security subsystem history log
     */
    security: {
      Type: Subsystem,
      set(security) {
        if (this.attr('activeFilter') === 'security') {
          this.getSubsystemIncidents(security, null);
        }
        return security;
      },
    },
    /**
     * @property {Subsystem} water
     * @parent i2web/components/subsystem/alarms/status/incident-list
     * @description The water subsystem history log
     */
    water: {
      Type: Subsystem,
      set(water) {
        if (this.attr('activeFilter') === 'water') {
          this.getSubsystemIncidents(water, null);
        }
        return water;
      },
    },
  },
  IncidentCapability,
  /**
   * @function datesWithHistory
   * From the sorted list of history return an array of date strings
   *
   * @param {Object} entries
   * @return {Array<string>}
   */
  datesWithHistory(entries) {
    return (entries)
      ? Object.keys(entries).map(e => parseInt(e, 10)).sort().reverse()
      : [];
  },
  /**
   * @function examineIncident
   * Render a custom component in the SidePanel to examine the incident history
   *
   * @param {HistoryLog} incident
   */
  examineIncident(incident) {
    Analytics.tag('alarms.activity.incident');
    SidePanel.right('<arcus-subsystem-alarms-status-incident-detail {incident-address}="address />', {
      address: incident.subjectAddress,
    });
  },
  /**
   * @function getIncidentsForDate
   * Get the Array of entries from the relavent day
   *
   * @param {String} date - The epoch for the start of the day
   * @return {null|Array<Object>}
   */
  getIncidentsForDate(date) {
    if (!this.attr('history')) return null;

    const entries = this.attr('history')[date];
    return (entries.length === 0) ? null : entries;
  },
  /**
   * @function getSubsystemIncidents
   * Get the last 100 incidents that occurred on 'subsystem'
   *
   * @param {Subsystem} subsystem
   * @param {Function} setAttr
   */
  getSubsystemIncidents(subsystem, token) {
    const days = this.attr('relevantIncidentDays');

    this.attr('loading', true);

    subsystem.ListHistoryEntries(100, token, true).then((results) => {
      this.attr('loading', false);

      // ITWO-11661 - If we have no results, set history to null so that
      // we can show that User there has been no recent Alarm activity
      if (results.results.length === 0) {
        this.attr('history', null);
        return;
      }

      const notBefore = moment().subtract(this.attr('howMuchHistory'), 'days');
      const inRange = results.results.filter((result) => {
        return moment(result.timestamp).isAfter(notBefore);
      });
      const groupedByDay = _.groupBy(inRange, (incident) => {
        return moment(incident.timestamp).startOf('day').valueOf();
      });

      const currentHistory = this.attr('history') || {};
      this.attr('history', _.merge(days, currentHistory, groupedByDay));

      if (results.nextToken) {
        const lastTime = results.results[results.results.length - 1].timestamp;
        if (moment(lastTime).isAfter(notBefore)) {
          this.getSubsystemIncidents(subsystem, results.nextToken);
        }
      }
    }).catch((e) => {
      this.attr('loading', false);
      Errors.log(e);
    });
  },
  /**
   * @function isActiveFilter
   * Whether 'alertType' is the currently active filter
   *
   * @param {string} alertType
   */
  isActiveFilter(alertType) {
    return this.attr('activeFilter') === alertType;
  },
  /**
   * @function isSubjectClickable
   * Whether or not the particular history is an incident and can be inspected further
   *
   * @param {Object} incident
   * @return {boolean}
   */
  isIncident(entry) {
    return entry.subjectAddress.includes('incident');
  },
  /**
   * @function setActiveFilter
   * Set the active filter to 'alertType'
   *
   * @param {string} alertType
   */
  setActiveFilter(alertType) {
    Analytics.tag(ANALYTICS_TAGS[alertType]);
    this.attr('activeFilter', alertType);
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-alarms-status-incident-list',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      Analytics.tag(
        ANALYTICS_TAGS[this.viewModel.attr('activeFilter')],
      );
    },
  },
});
