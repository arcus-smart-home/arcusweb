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

/**
 * @module {canMap} i2web/models/scheduler Scheduler
 * @parent app.models
 *
 * Model of a Scheduler.
 */
import canMap from 'can-map';
import canList from 'can-list';
import canBatch from 'can-event/batch/';
import 'can-map-define';
import 'can-construct-super';
import isEmptyObject from 'can-util/js/is-empty-object/is-empty-object';
import getAppState from 'i2web/plugins/get-app-state';
import { fromPlaceToDeviceTimezone } from 'i2web/components/schedule/from-to-timezones';
import { ModelConnection } from './base';
import scheduleCommandFormat from 'config/scheduler-descriptions';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import _find from 'lodash/find';
import _some from 'lodash/some';

function commandFormatGenerator(verbose = true) {
  return function getCommandDescription() {
    if (this.attr('hasCommands') && this.attr('scheduler:nextFireSchedule')) {
      const nextFireSchedule = this.attr('scheduler:nextFireSchedule');
      const group = this.attr(`sched:group:${nextFireSchedule}`);
      const nextFireCommandID = this.attr(`sched:nextFireCommand:${nextFireSchedule}`);
      const nextFireCommand = this.attr(`scheduler:commands.${nextFireCommandID}`);
      const formatter = scheduleCommandFormat[`${group.toLowerCase()}:${nextFireSchedule.toLowerCase()}`];

      if (formatter && nextFireCommand) {
        return formatter[verbose ? 'verbose' : 'terse'].apply(nextFireCommand);
      }

      return '';
    }

    return '';
  };
}

const Scheduler = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} i2web/models/scheduler.static.metadata metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/scheduler.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'scheduler',
    destination: 'SERV:{namespace}:{base:id}',
  },
}, {
  init() {
    this._super(arguments);

    // Instance keys are dynamic and thus not pre-defined as writeableAttributes, so they must be added manually
    this.attr('instanceKeys').forEach((key) => {
      this.attr('writeableAttributes').push(`sched:enabled:${key}`);
    });
  },
  define: {
    /**
     * @property {Device} device
     * @parent i2web/models/scheduler
     * @description The device that is scheduled
     */
    device: {
      get() {
        const deviceAddress =
          this.attr('scheduler:target') || this.attr('controller');
        return _find(getAppState().attr('devices'), d => d.attr('base:address') === deviceAddress);
      },
    },
    /**
     * @property {Array} instanceKeys
     * @parent i2web/models/scheduler
     * @description Instance keys
     */
    instanceKeys: {
      get() {
        return canMap.keys(this.attr('base:instances') || new canList([]));
      },
    },
    /**
     * @property {canMap} commandsByDay
     * @parent i2web/models/scheduler
     * @description The commands for each day of the week
     */
    commandsByDay: {
      get() {
        const commands = this.attr('scheduler:commands');
        if (commands) {
          // We take special care to not use an observable here because we are
          // just displaying the command, and we need to manipulate the day and
          // time of the command to render it in a browser local timezone.
          // Changing the properties of the command inline will cause change
          // events which will ensure that commandsByDay runs again and again...
          // ad nauseum.
          return this.scheduledCommandsByDay(commands.attr());
        }
        // Irrigation controller in manual mode. Does not have commands,
        // and does not have a mode.
        if (!this.type) {
          return this.irrigationEventsByDay([]);
        }
        // This branch should only be executed when operating on an irrigation
        // controller that is not in MANUAL mode.
        const mode = this.type.toLowerCase();
        const events =
          this.irrigationEventsFor(this.attr('device.base:address'), mode);
        return (mode === 'weekly')
          ? this.irrigationEventsByDay(events.attr())
          : this.irrigationIntervalEvents(events.attr());
      },
    },
    /**
     * @property {boolean} hasCommands
     * @parent i2web/models/scheduler
     * @description Whether a scheduler has any commands
     */
    hasCommands: {
      get() {
        const commands = this.attr('scheduler:commands');
        if (commands) { return !isEmptyObject(commands.attr()); }

        const device = this.attr('device');
        if (device && device.hasCapability('irrsched')) {
          const address = device.attr('base:address');
          const events = ['weekly', 'even', 'odd', 'interval'].map((m) => {
            const e = this.irrigationEventsFor(address, m);
            return e && e.length;
          }).filter(c => c > 0);
          return events.length > 0;
        }
        return false;
      },
    },
    /**
     * @property {boolean} isFollowed
     * @parent i2web/models/scheduler
     * @description Whether a scheduler is followed (enabled)
     */
    isFollowed: {
      get() {
        const device = this.attr('device');
        if (device && device.hasCapability && device.hasCapability('therm')) {
          const deviceAddress = device.attr('base:address');
          const climateSubsystem =
            getAppState().attr('subsystems').findByName('subclimate');
          return !!climateSubsystem
            .attr(`subclimate:thermostatSchedules.${deviceAddress}.enabled`);
        }

        if (device && device.hasCapability && device.hasCapability('irrsched')) {
          const deviceAddress = device.attr('base:address');
          const lawngarden =
            getAppState().attr('subsystems').findByName('sublawnngarden');
          const status =
            lawngarden.attr(`sublawnngarden:scheduleStatus.${deviceAddress}`);
          return status.attr('enabled');
        }

        return _some(this.attr('instanceKeys'), (key) => {
          return this.attr(`sched:enabled:${key}`);
        });
      },
    },
    /**
     * @property {boolean} nextCommandDescriptionVerbose
     * @parent i2web/models/scheduler
     * @description Verbose description of the next command
     */
    nextCommandDescriptionVerbose: {
      get: commandFormatGenerator(),
    },
    /**
     * @property {boolean} nextCommandDescriptionTerse
     * @parent i2web/models/scheduler
     * @description Terse description of the next command
     */
    nextCommandDescriptionTerse: {
      get: commandFormatGenerator(false),
    },
  },
  /**
   * @function followSchedule
   * @parent i2web/models/scheduler
   * @description Toggles whether the schedule should be followed
   */
  toggleFollowSchedule() {
    canBatch.start();
    this.attr('instanceKeys').forEach((key) => {
      const schedKey = `sched:enabled:${key}`;
      this.attr(schedKey, !this.attr(schedKey));
    });
    canBatch.stop();
    this.save();
  },
  /**
   * @function {canMap} irrigationEventsFor
   * @param {String} controller The irrigation controllers address
   * @param {String} mode The selected mode for the controller
   * @description Return the events object for a particular irrigation mode
   */
  irrigationEventsFor(controller, mode) {
    const lawngarden =
      getAppState().attr('subsystems').findByName('sublawnngarden');
    const schedules = `sublawnngarden:${mode}Schedules.${controller}.events`;
    return lawngarden.attr(schedules);
  },
  /**
   * @function {canMap} irrigationEventsByDay
   * @param {Array} events The 'mode' events for this specific controller
   * @description Organize the schedule events by day
   */
  irrigationEventsByDay(events) {
    const days = { MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [] };
    events.forEach((e) => {
      if (e.type === 'WEEKLY' && e.events.length) {
        e.days.forEach((day) => {
          const [, eventTime] = fromPlaceToDeviceTimezone(e.timeOfDay);
          // Normalize the irrigation schedule event to be as close as possible
          // to the other schedule events
          const event = Object.assign({}, {
            days: e.days,
            events: e.events,
            id: e.eventId,
            mode: e.type,
            scheduleId: e.type,
            time: eventTime,
          });
          days[day].push(event);
        });
      }
    });
    return new canMap(days);
  },
  /**
   * @function {canMap} irrigationIntervalEvents
   * @param {Array} events The 'mode' events for this specific controller
   * @description Normalize the interval events to a single day (since INTERVAL)
   * mode doesn't understand the concept of multiple days
   */
  irrigationIntervalEvents(events) {
    const days = { MON: [] };
    events.forEach((e) => {
      const [, eventTime] = fromPlaceToDeviceTimezone(e.timeOfDay);
      days.MON.push({
        events: e.events,
        id: e.eventId,
        mode: e.type,
        scheduleId: e.type,
        time: eventTime,
      });
    });
    return new canMap(days);
  },
  /**
   * @function {canMap} scheduledCommandsByDay
   * @param {Object} commands
   * @description The commands for each day of the week for all devices that use
   * the schedule services (and irrigation devices in Manual mode)
   */
  scheduledCommandsByDay(commands) {
    const days = { MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [] };
    Object.keys(commands).forEach((commandID) => {
      const command = commands[commandID];
      const [eventDays, eventTime] = fromPlaceToDeviceTimezone(command.time, command.days);
      const newCommand = Object.assign({}, command, { days: eventDays, time: eventTime });
      eventDays.forEach((day) => {
        days[day].push(new canMap(newCommand));
      });
    });
    return new canMap(days);
  },
});

export const SchedulerConnection = ModelConnection('scheduler', 'base:address', Scheduler);

export default Scheduler;
