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
 * @module {Object} i2web/models/IrrigationSchedulable IrrigationSchedulable
 * @parent app.models.capabilities
 *
 * Methods for pushing irrigation schedules to the device.
 */
export default {
  writeableAttributes: [
    /**
     * @property {boolean} irrsched\:refreshSchedule
     *
     * If true then the device needs to schedule synchronized with the platform.
     *
     */
    'irrsched:refreshSchedule',
  ],
  methods: {
    /**
     * @function EnableSchedule
     *
     * Enables scheduling on the device
     *
     * @return {Promise}
     */
    EnableSchedule() {
      return Bridge.request('irrsched:EnableSchedule', this.GetDestination(), {});
    },
    /**
     * @function DisableSchedule
     *
     * Disables schedulig on the device for an optional amount of time
     *
     * @param {int} duration The duration in minutes to disable the schedule.  -1 implies indefinitely
     * @return {Promise}
     */
    DisableSchedule(duration) {
      return Bridge.request('irrsched:DisableSchedule', this.GetDestination(), {
        duration,
      });
    },
    /**
     * @function ClearEvenOddSchedule
     *
     * Clears the even/odd day schedule for the given zone
     *
     * @param {string} zone The zone to clear
     * @param {string} opId The operation ID, this should be returned in success or failure events for alignment
     * @return {Promise}
     */
    ClearEvenOddSchedule(zone, opId) {
      return Bridge.request('irrsched:ClearEvenOddSchedule', this.GetDestination(), {
        zone,
        opId,
      });
    },
    /**
     * @function SetEvenOddSchedule
     *
     * Sets an even/odd day schedule for the given zone
     *
     * @param {string} zone The zone to set the schedule on
     * @param {boolean} even true for an even day schedule, false for an odd day
     * @param {list<Object>} transitions Each transition to set containing startTime and duration
     * @param {string} opId The operation ID, this should be returned in success or failure events for alignment
     * @return {Promise}
     */
    SetEvenOddSchedule(zone, even, transitions, opId) {
      return Bridge.request('irrsched:SetEvenOddSchedule', this.GetDestination(), {
        zone,
        even,
        transitions,
        opId,
      });
    },
    /**
     * @function ClearIntervalSchedule
     *
     * Clears the interval schedule for the given zone
     *
     * @param {string} zone The zone to clear
     * @param {string} opId The operation ID, this should be returned in success or failure events for alignment
     * @return {Promise}
     */
    ClearIntervalSchedule(zone, opId) {
      return Bridge.request('irrsched:ClearIntervalSchedule', this.GetDestination(), {
        zone,
        opId,
      });
    },
    /**
     * @function SetIntervalSchedule
     *
     * Sets an interval schedule for the given zone
     *
     * @param {string} zone The zone to set the schedule on
     * @param {int} days The number of days in the interval
     * @param {list<Object>} transitions Each transition to set containing startTime and duration
     * @param {string} opId The operation ID, this should be returned in success or failure events for alignment
     * @return {Promise}
     */
    SetIntervalSchedule(zone, days, transitions, opId) {
      return Bridge.request('irrsched:SetIntervalSchedule', this.GetDestination(), {
        zone,
        days,
        transitions,
        opId,
      });
    },
    /**
     * @function SetIntervalStart
     *
     * Sets the interval start date
     *
     * @param {string} zone The zone to set the interval start on
     * @param {timestamp} startDate The timestamp of the day on which the interval schedule should start
     * @param {string} opId The operation ID, this should be returned in success or failure events for alignment
     * @return {Promise}
     */
    SetIntervalStart(zone, startDate, opId) {
      return Bridge.request('irrsched:SetIntervalStart', this.GetDestination(), {
        zone,
        startDate,
        opId,
      });
    },
    /**
     * @function ClearWeeklySchedule
     *
     * Clears the weekly schedule for the given zone
     *
     * @param {string} zone The zone to clear
     * @param {string} opId The operation ID, this should be returned in success or failure events for alignment
     * @return {Promise}
     */
    ClearWeeklySchedule(zone, opId) {
      return Bridge.request('irrsched:ClearWeeklySchedule', this.GetDestination(), {
        zone,
        opId,
      });
    },
    /**
     * @function SetWeeklySchedule
     *
     * Sets a weekly schedule for the given zone
     *
     * @param {string} zone The zone to set the schedule on
     * @param {set<string>} days The days to set, each entry will be one of MON,TUE,WED,THU,FRI,SAT or SUN
     * @param {list<Object>} transitions Each transition to set containing startTime and duration
     * @param {string} opId The operation ID, this should be returned in success or failure events for alignment
     * @return {Promise}
     */
    SetWeeklySchedule(zone, days, transitions, opId) {
      return Bridge.request('irrsched:SetWeeklySchedule', this.GetDestination(), {
        zone,
        days,
        transitions,
        opId,
      });
    },
  },
  events: {
    /**
     * @function onScheduleEnabled
     *
     * Emitted as a result of EnableSchedule
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onScheduleEnabled(callback) {
      Cornea.on('irrsched irrsched:ScheduleEnabled', callback);
    },
    /**
     * @function onScheduleApplied
     *
     * Emitted when a schedule is successfully written to the device
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onScheduleApplied(callback) {
      Cornea.on('irrsched irrsched:ScheduleApplied', callback);
    },
    /**
     * @function onScheduleCleared
     *
     * Emitted when a schedule is successfully cleared from the device
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onScheduleCleared(callback) {
      Cornea.on('irrsched irrsched:ScheduleCleared', callback);
    },
    /**
     * @function onScheduleFailed
     *
     * Emitted when a schedule could not be applied on the device
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onScheduleFailed(callback) {
      Cornea.on('irrsched irrsched:ScheduleFailed', callback);
    },
    /**
     * @function onScheduleClearFailed
     *
     * Emitted when a schedule failed to be cleared from the device
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onScheduleClearFailed(callback) {
      Cornea.on('irrsched irrsched:ScheduleClearFailed', callback);
    },
    /**
     * @function onSetIntervalStartSucceeded
     *
     * Emitted when setting the interval start date succeeds
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onSetIntervalStartSucceeded(callback) {
      Cornea.on('irrsched irrsched:SetIntervalStartSucceeded', callback);
    },
    /**
     * @function onSetIntervalStartFailed
     *
     * Emitted when there is a failure to set the interval start date
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onSetIntervalStartFailed(callback) {
      Cornea.on('irrsched irrsched:SetIntervalStartFailed', callback);
    },
  },

};
