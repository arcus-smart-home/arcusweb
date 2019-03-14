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
 * @module {Object} i2web/models/LawnNGardenSubsystem LawnNGardenSubsystem
 * @parent app.models.capabilities
 *
 * Lawn &amp; Garden Subsystem
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function StopWatering
     *
     * Stops a controller from watering whether it was started manually or not.
     *
     * @param {String} controller The address of the controller to stop
     * @param {boolean} [currentOnly] Ignored if watering was triggered manually.  If watering was triggered on a schedule this controls whether just this zone is stopped or all zones in the scheduled event.  If not provided, it will be assumed to be true
     * @return {Promise}
     */
    StopWatering(controller, currentOnly) {
      return Bridge.request('sublawnngarden:StopWatering', this.GetDestination(), {
        controller,
        currentOnly,
      });
    },
    /**
     * @function SwitchScheduleMode
     *
     * Changes the scheduling mode on a controller between the various types
     *
     * @param {string} controller The address of the controller
     * @param {enum} mode The new mode to enable on the device
     * @return {Promise}
     */
    SwitchScheduleMode(controller, mode) {
      return Bridge.request('sublawnngarden:SwitchScheduleMode', this.GetDestination(), {
        controller,
        mode,
      });
    },
    /**
     * @function EnableScheduling
     *
     * Enables the current schedule
     *
     * @param {string} controller The address of the controller
     * @return {Promise}
     */
    EnableScheduling(controller) {
      return Bridge.request('sublawnngarden:EnableScheduling', this.GetDestination(), {
        controller,
      });
    },
    /**
     * @function DisableScheduling
     *
     * Disables the current schedule
     *
     * @param {string} controller The address of the controller
     * @return {Promise}
     */
    DisableScheduling(controller) {
      return Bridge.request('sublawnngarden:DisableScheduling', this.GetDestination(), {
        controller,
      });
    },
    /**
     * @function Skip
     *
     * Skips scheduled watering events for a specific length of time
     *
     * @param {string} controller The address of the controller
     * @param {int} hours The number of hours to skip
     * @return {Promise}
     */
    Skip(controller, hours) {
      return Bridge.request('sublawnngarden:Skip', this.GetDestination(), {
        controller,
        hours,
      });
    },
    /**
     * @function CancelSkip
     *
     * Cancels skipping (rain delay)
     *
     * @param {string} controller The address of the controller
     * @return {Promise}
     */
    CancelSkip(controller) {
      return Bridge.request('sublawnngarden:CancelSkip', this.GetDestination(), {
        controller,
      });
    },
    /**
     * @function ConfigureIntervalSchedule
     *
     * Configures the start time and interval for the interval schedule
     *
     * @param {string} controller The address of the controller
     * @param {timestamp} startTime The time on which the interval starts.  Technically it will start on midnight of the date given
     * @param {int} days The number of interval days
     * @return {Promise}
     */
    ConfigureIntervalSchedule(controller, startTime, days) {
      return Bridge.request('sublawnngarden:ConfigureIntervalSchedule', this.GetDestination(), {
        controller,
        startTime,
        days,
      });
    },
    /**
     * @function CreateWeeklyEvent
     *
     * Creates a weekly schedule event
     *
     * @param {string} controller The address of the controller
     * @param {set<string>} days The days the event will fire.  Must be MON, TUE, WED, THU, FRI, SAT, SUN
     * @param {string} timeOfDay The time of day the event starts.  Must be of the form HH:mm in the 24 our clock
     * @param {list<ZoneDuration>} zoneDurations The length of time to water for each zone
     * @return {Promise}
     */
    CreateWeeklyEvent(controller, days, timeOfDay, zoneDurations) {
      return Bridge.request('sublawnngarden:CreateWeeklyEvent', this.GetDestination(), {
        controller,
        days,
        timeOfDay,
        zoneDurations,
      });
    },
    /**
     * @function UpdateWeeklyEvent
     *
     * Updates a weekly schedule event
     *
     * @param {string} controller The address of the controller
     * @param {string} eventId The identifier for the event to remove
     * @param {set<string>} days The days the event will fire.  Must be MON, TUE, WED, THU, FRI, SAT, SUN
     * @param {string} timeOfDay The time of day the event starts.  Must be of the form HH:mm in the 24 our clock
     * @param {list<ZoneDuration>} zoneDurations The length of time to water for each zone
     * @param {enum} [day] The day to update.  If not provided all days will be updated
     * @return {Promise}
     */
    UpdateWeeklyEvent(controller, eventId, days, timeOfDay, zoneDurations, day) {
      return Bridge.request('sublawnngarden:UpdateWeeklyEvent', this.GetDestination(), {
        controller,
        eventId,
        days,
        timeOfDay,
        zoneDurations,
        day,
      });
    },
    /**
     * @function RemoveWeeklyEvent
     *
     * Removes a weekly schedule event
     *
     * @param {string} controller The address of the controller
     * @param {string} eventId The identifier for the event to remove
     * @param {enum} [day] The specific day to remove.  If not provided all days (i.e. the entire event) will be removed
     * @return {Promise}
     */
    RemoveWeeklyEvent(controller, eventId, day) {
      return Bridge.request('sublawnngarden:RemoveWeeklyEvent', this.GetDestination(), {
        controller,
        eventId,
        day,
      });
    },
    /**
     * @function CreateScheduleEvent
     *
     * Creates a non-weekly scheduling event
     *
     * @param {string} controller The address of the controller
     * @param {enum} mode The mode of the schedule to add the event to
     * @param {string} timeOfDay The time of day the event starts.  Must be of the form HH:mm in the 24 our clock
     * @param {list<ZoneDuration>} zoneDurations The length of time to water for each zone
     * @return {Promise}
     */
    CreateScheduleEvent(controller, mode, timeOfDay, zoneDurations) {
      return Bridge.request('sublawnngarden:CreateScheduleEvent', this.GetDestination(), {
        controller,
        mode,
        timeOfDay,
        zoneDurations,
      });
    },
    /**
     * @function UpdateScheduleEvent
     *
     * Updates an existing non-weekly schedule event
     *
     * @param {string} controller The address of the controller
     * @param {enum} mode The mode of the schedule
     * @param {string} eventId The identifier for the event to remove
     * @param {string} timeOfDay The time of day the event starts.  Must be of the form HH:mm in the 24 our clock
     * @param {list<ZoneDuration>} zoneDurations The length of time to water for each zone
     * @return {Promise}
     */
    UpdateScheduleEvent(controller, mode, eventId, timeOfDay, zoneDurations) {
      return Bridge.request('sublawnngarden:UpdateScheduleEvent', this.GetDestination(), {
        controller,
        mode,
        eventId,
        timeOfDay,
        zoneDurations,
      });
    },
    /**
     * @function RemoveScheduleEvent
     *
     * Removes an existing non-weekly schedule event
     *
     * @param {string} controller The address of the controller
     * @param {enum} mode The mode of the schedule
     * @param {string} eventId The identifier for the event to remove
     * @return {Promise}
     */
    RemoveScheduleEvent(controller, mode, eventId) {
      return Bridge.request('sublawnngarden:RemoveScheduleEvent', this.GetDestination(), {
        controller,
        mode,
        eventId,
      });
    },
    /**
     * @function SyncSchedule
     *
     * Attempts to repush an entire scheduled identified by the mode down to the device, typically useful when applying some event has failed
     *
     * @param {string} controller The address of the controller
     * @param {enum} mode The mode of the schedule
     * @return {Promise}
     */
    SyncSchedule(controller, mode) {
      return Bridge.request('sublawnngarden:SyncSchedule', this.GetDestination(), {
        controller,
        mode,
      });
    },
    /**
     * @function SyncScheduleEvent
     *
     * Attempts to repush an entire scheduled event down to the device, typically useful when applying some event has failed
     *
     * @param {string} controller The address of the controller
     * @param {enum} mode The mode of the schedule
     * @param {string} eventId The identifier for the event to remove
     * @return {Promise}
     */
    SyncScheduleEvent(controller, mode, eventId) {
      return Bridge.request('sublawnngarden:SyncScheduleEvent', this.GetDestination(), {
        controller,
        mode,
        eventId,
      });
    },
  },
  events: {
    /**
     * @function onStartWatering
     *
     * Fired when a zone starts watering.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onStartWatering(callback) {
      Cornea.on('sublawnngarden sublawnngarden:StartWatering', callback);
    },
    /**
     * @function onStopWatering
     *
     * Fired when a zone stops watering.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onStopWatering(callback) {
      Cornea.on('sublawnngarden sublawnngarden:StopWatering', callback);
    },
    /**
     * @function onSkipWatering
     *
     * Fired a controller is set to skip watering.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onSkipWatering(callback) {
      Cornea.on('sublawnngarden sublawnngarden:SkipWatering', callback);
    },
    /**
     * @function onUpdateSchedule
     *
     * Fired when the subsystem schedule is updated.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onUpdateSchedule(callback) {
      Cornea.on('sublawnngarden sublawnngarden:UpdateSchedule', callback);
    },
    /**
     * @function onApplyScheduleToDevice
     *
     * Fired when a schedule is applied to a controller.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onApplyScheduleToDevice(callback) {
      Cornea.on('sublawnngarden sublawnngarden:ApplyScheduleToDevice', callback);
    },
    /**
     * @function onApplyScheduleToDeviceFailed
     *
     * Fired when a schedule fails to be applied to a controller.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onApplyScheduleToDeviceFailed(callback) {
      Cornea.on('sublawnngarden sublawnngarden:ApplyScheduleToDeviceFailed', callback);
    },
  },

};
