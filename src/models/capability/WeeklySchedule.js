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

/**
 * @module {Object} i2web/models/WeeklySchedule WeeklySchedule
 * @parent app.models.capabilities
 *
 * A schedule that has a set of commands that should be run at different times of day
each day of the week.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function ScheduleWeeklyCommand
     *
     * Adds or modifies a scheduled weekly event running at the given time on the requested days.
Note that if an event with the same messageType, attributes and time of day exists this call will modify that event.
     *
     * @param {set<string>} days The days of the week that this command should be run on.  There must be at least one day in this set.
     * @param {string} [time] The time of day formatted as HH:MM:SS using a 24-hour clock, in place-local time (see Place#TimeZone), that the command should be sent.  This may not be set if mode is SUNRISE or SUNSET, this must be set of mode is ABSOLUTE or unspecified.
     * @param {enum} [mode] What mode this command is scheduled in:
ABSOLUTE - The time reported in time will be used.
SUNRISE - The command will execute at local sunrise + offsetMin.  The time reported in the time field will be the calculated run time for today.
SUNSET - The command will execute at local sunset + offsetMin. The time reported in the time field will be the calculated run time for today.
     * @param {int} [offsetMinutes] This will always be 0 if the mode is set to ABSOLUTE.  If mode is set to SUNRISE or SUNSET this will be the offset / delta from sunrise or sunset that the event should run at.  A negative number means the event should happen before sunrise/sunset, a postive means after.
     * @param {string} [messageType] Default: base:SetAttributes. Type of message to be sent.
     * @param {map<any>} attributes The attributes to send with the request.
     * @return {Promise}
     */
    ScheduleWeeklyCommand(days, time, mode, offsetMinutes, messageType, attributes) {
      return Bridge.request('schedweek:ScheduleWeeklyCommand', this.GetDestination(), {
        days,
        time,
        mode,
        offsetMinutes,
        messageType,
        attributes,
      });
    },
    /**
     * @function UpdateWeeklyCommand
     *
     * Updates schedule for an existing scheduled command.
     *
     * @param {string} commandId The id of the command to update. Only the specified fields will be changed.
     * @param {set<string>} [days] If specified it will update the schedule to only run on the requested days.
     * @param {enum} [mode] What mode this command is scheduled in:
ABSOLUTE - The time reported in time will be used.
SUNRISE - The command will execute at local sunrise + offsetMin.  The time reported in the time field will be the calculated run time for today.
SUNSET - The command will execute at local sunset + offsetMin. The time reported in the time field will be the calculated run time for today.
     * @param {int} [offsetMinutes] This will always be 0 if the mode is set to ABSOLUTE.  If mode is set to SUNRISE or SUNSET this will be the offset / delta from sunrise or sunset that the event should run at.  A negative number means the event should happen before sunrise/sunset, a postive means after.
     * @param {string} [time] If specified it will update the time of each instance of this event.
     * @param {string} [messageType] Default: base:SetAttributes. Type of message to be sent.
     * @param {map<any>} [attributes] If specified it will update the attributes to be included in the message.
     * @return {Promise}
     */
    UpdateWeeklyCommand(commandId, days, mode, offsetMinutes, time, messageType, attributes) {
      return Bridge.request('schedweek:UpdateWeeklyCommand', this.GetDestination(), {
        commandId,
        days,
        mode,
        offsetMinutes,
        time,
        messageType,
        attributes,
      });
    },
  },
  events: {},

};
