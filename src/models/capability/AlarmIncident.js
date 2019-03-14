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

import Bridge from 'i2web/cornea/bridge';

import Cornea from 'i2web/cornea/';

/**
 * @module {Object} i2web/models/AlarmIncident AlarmIncident
 * @parent app.models.capabilities
 *
 * Model of an alarm incident
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function Verify
     *
     * Escalates a PreAlert incident to Alerting immediately.
     *
     * @return {Promise}
     */
    Verify() {
      return Bridge.request('incident:Verify', this.GetDestination(), {});
    },
    /**
     * @function Cancel
     *
     * Attempts to cancel the current alert, if one is active.  This will attempt to silence all alarms and stop the alert from going to the monitoring center if the alert is professionally monitored.
     *
     * @return {Promise}
     */
    Cancel() {
      return Bridge.request('incident:Cancel', this.GetDestination(), {});
    },
    /**
     * @function ListHistoryEntries
     *
     * Returns a list of all the history log entries associated with this incident
     *
     * @param {int} [limit] The maximum number of events to return (defaults to 10)
     * @param {string} [token] The token from a previous query to use for retrieving the next set of results
     * @return {Promise}
     */
    ListHistoryEntries(limit, token) {
      return Bridge.request('incident:ListHistoryEntries', this.GetDestination(), {
        limit,
        token,
      });
    },
  },
  events: {
    /**
     * @function onCOAlert
     *
     * Fired when a carbon monoxide alarm is triggered
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onCOAlert(callback) {
      Cornea.on('incident incident:COAlert', callback);
    },
    /**
     * @function onPanicAlert
     *
     * Fired when a panic alarm is triggered
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPanicAlert(callback) {
      Cornea.on('incident incident:PanicAlert', callback);
    },
    /**
     * @function onSecurityAlert
     *
     * Fired when a security alarm is triggered
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onSecurityAlert(callback) {
      Cornea.on('incident incident:SecurityAlert', callback);
    },
    /**
     * @function onSmokeAlert
     *
     * Fired when a smoke alarm is triggered
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onSmokeAlert(callback) {
      Cornea.on('incident incident:SmokeAlert', callback);
    },
    /**
     * @function onWaterAlert
     *
     * Fired when a water alarm is triggered
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onWaterAlert(callback) {
      Cornea.on('incident incident:WaterAlert', callback);
    },
    /**
     * @function onHistoryAdded
     *
     * Fired when new history about an incident is added
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onHistoryAdded(callback) {
      Cornea.on('incident incident:HistoryAdded', callback);
    },
    /**
     * @function onCompleted
     *
     * Fired when an incident has fully completed
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onCompleted(callback) {
      Cornea.on('incident incident:Completed', callback);
    },
  },
  ALERTSTATE_PREALERT: 'PREALERT',
  ALERTSTATE_ALERT: 'ALERT',
  ALERTSTATE_CANCELLING: 'CANCELLING',
  ALERTSTATE_COMPLETE: 'COMPLETE',
  MONITORINGSTATE_NONE: 'NONE',
  MONITORINGSTATE_PENDING: 'PENDING',
  MONITORINGSTATE_DISPATCHING: 'DISPATCHING',
  MONITORINGSTATE_DISPATCHED: 'DISPATCHED',
  MONITORINGSTATE_REFUSED: 'REFUSED',
  MONITORINGSTATE_CANCELLED: 'CANCELLED',
  MONITORINGSTATE_FAILED: 'FAILED',
  PLATFORMSTATE_PREALERT: 'PREALERT',
  PLATFORMSTATE_ALERT: 'ALERT',
  PLATFORMSTATE_CANCELLING: 'CANCELLING',
  PLATFORMSTATE_COMPLETE: 'COMPLETE',
  HUBSTATE_PREALERT: 'PREALERT',
  HUBSTATE_ALERT: 'ALERT',
  HUBSTATE_CANCELLING: 'CANCELLING',
  HUBSTATE_COMPLETE: 'COMPLETE',
  ALERT_SECURITY: 'SECURITY',
  ALERT_PANIC: 'PANIC',
  ALERT_SMOKE: 'SMOKE',
  ALERT_CO: 'CO',
  ALERT_WATER: 'WATER',
  ALERT_CARE: 'CARE',
  ALERT_WEATHER: 'WEATHER',
};
