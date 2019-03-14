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
 * @module {Object} i2web/models/SchedulerService SchedulerService
 * @parent app.models.services
 *
 * Handler for creating and modifying schedules.
 */
export default {
  /**
   * @function ListSchedulers
   *
   * Lists all the schedulers for a given place.
   *
   * @param {string} placeId The id of the place to list the schedulers for.
   * @param {boolean} [includeWeekdays] if the results should include schedule for each day of the week.  Default value is true.
   * @return {Promise}
   */
  ListSchedulers(placeId, includeWeekdays) {
    return Bridge.request('scheduler:ListSchedulers', 'SERV:scheduler:', {
      placeId,
      includeWeekdays,
    });
  },
  /**
   * @function GetScheduler
   *
   * Creates a new Scheduler or returns the existing scheduler for target.  Generally this is used when there is no Scheduler in ListSchedulers for the given object.
   *
   * @param {string} target The address of the thing to schedule.
   * @return {Promise}
   */
  GetScheduler(target) {
    return Bridge.request('scheduler:GetScheduler', 'SERV:scheduler:', {
      target,
    });
  },
  /**
   * @function FireCommand
   *
   * Fires the requested command right now, generally used for testing.
   *
   * @param {string} target The address of the thing to schedule.
   * @param {string} commandId The id of the command to fire
   * @return {Promise}
   */
  FireCommand(target, commandId) {
    return Bridge.request('scheduler:FireCommand', 'SERV:scheduler:', {
      target,
      commandId,
    });
  },
  /**
   * @function ScheduleCommands
   *
   * Adds or modifies a scheduled weekly event running at the given time on the requested days.
Note that if an event with the same messageType, attributes and time of day exists this call will modify that event.
If no Scheduler exists for the given target then it will be created.  If no Schedule exists for the given schedule, it will be created.
   *
   * @param {string} target The address of the thing to schedule.
   * @param {string} group The group for the schedules if they are being created.  If they already exist and are part of a different group, this will return an error
   * @param {list<TimeOfDayCommand>} commands A list of commands to insert/update/delete.  The referenced schedule ids will be created if needed.  If the id is null this will be considered an insert, if the id is populated and there are days this will be an update, if there is an id and no days it will be a delete.
   * @return {Promise}
   */
  ScheduleCommands(target, group, commands) {
    return Bridge.request('scheduler:ScheduleCommands', 'SERV:scheduler:', {
      target,
      group,
      commands,
    });
  },
  /**
   * @function ScheduleWeeklyCommand
   *
   * This is a convenience for Scheduler#GetScheduler(target)#AddSchedule(schedule, &#x27;WEEKLY&#x27;)#ScheduleWeeklyEvent(time, messageType, attributeMap).
Adds or modifies a scheduled weekly event running at the given time on the requested days.
Note that if an event with the same messageType, attributes and time of day exists this call will modify that event.
If no Scheduler exists for the given target then it will be created.  If no Schedule exists for the given schedule, it will be created.
   *
   * @param {string} target The address of the thing to schedule.
   * @param {string} schedule The name of the schedule to update or create.
   * @param {set<string>} days The days of the week that this command should be run on.  There must be at least one day in this set.
   * @param {enum} [mode] What mode this command is scheduled in:
ABSOLUTE - The time reported in time will be used.
SUNRISE - The command will execute at local sunrise + offsetMin.  The time reported in the time field will be the calculated run time for today.
SUNSET - The command will execute at local sunset + offsetMin. The time reported in the time field will be the calculated run time for today.
   * @param {string} [time] The time of day formatted as HH:MM using a 24-hour clock, in place-local time (see Place#TimeZone), that the command should be sent.
   * @param {int} [offsetMinutes] This will always be 0 if the mode is set to ABSOLUTE.  If mode is set to SUNRISE or SUNSET this will be the offset / delta from sunrise or sunset that the event should run at.  A negative number means the event should happen before sunrise/sunset, a postive means after.
   * @param {string} messageType Default: base:SetAttributes. Type of message to be sent.
   * @param {map<any>} attributes The attributes to send with the request.
   * @return {Promise}
   */
  ScheduleWeeklyCommand(target, schedule, days, mode, time, offsetMinutes, messageType, attributes) {
    return Bridge.request('scheduler:ScheduleWeeklyCommand', 'SERV:scheduler:', {
      target,
      schedule,
      days,
      mode,
      time,
      offsetMinutes,
      messageType,
      attributes,
    });
  },
  /**
   * @function UpdateWeeklyCommand
   *
   * This is a convenience for Scheduler#GetScheduler(target)[schedule]#UpdateWeeklyEvent(commandId, time, attributes).
Updates schedule for an existing scheduled event.
   *
   * @param {string} target The address of the thing being scheduled.
   * @param {string} schedule The name of the schedule being modified.
   * @param {string} commandId The id of the command to update. Only the specified fields will be changed.
   * @param {set<string>} [days] If specified it will update the schedule to only run on the requested days.
   * @param {enum} [mode] What mode this command is scheduled in:
ABSOLUTE - The time reported in time will be used.
SUNRISE - The command will execute at local sunrise + offsetMin.  The time reported in the time field will be the calculated run time for today.
SUNSET - The command will execute at local sunset + offsetMin. The time reported in the time field will be the calculated run time for today.
   * @param {string} [time] The time of day formatted as HH:MM using a 24-hour clock, in place-local time (see Place#TimeZone), that the command should be sent.
   * @param {int} [offsetMinutes] This will always be 0 if the mode is set to ABSOLUTE.  If mode is set to SUNRISE or SUNSET this will be the offset / delta from sunrise or sunset that the event should run at.  A negative number means the event should happen before sunrise/sunset, a postive means after.
   * @param {string} [messageType] Default: base:SetAttributes. Type of message to be sent.
   * @param {map<any>} [attributes] If specified it will update the attributes to be included in the message.
   * @return {Promise}
   */
  UpdateWeeklyCommand(target, schedule, commandId, days, mode, time, offsetMinutes, messageType, attributes) {
    return Bridge.request('scheduler:UpdateWeeklyCommand', 'SERV:scheduler:', {
      target,
      schedule,
      commandId,
      days,
      mode,
      time,
      offsetMinutes,
      messageType,
      attributes,
    });
  },
  /**
   * @function DeleteCommand
   *
   * This is a convenience for Scheduler#GetScheduler(target)[schedule]#DeleteCommand(comandId).
Deletes any occurrence of the specified command from the week.
   *
   * @param {string} target The address of the thing being scheduled.
   * @param {string} schedule The name of the schedule being modified.
   * @param {string} commandId The id of the command to update. Only the specified fields will be changed.
   * @return {Promise}
   */
  DeleteCommand(target, schedule, commandId) {
    return Bridge.request('scheduler:DeleteCommand', 'SERV:scheduler:', {
      target,
      schedule,
      commandId,
    });
  },
};
