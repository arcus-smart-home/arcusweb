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
import $ from 'jquery';
import moment from 'moment';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import Analytics from 'i2web/plugins/analytics';
import getAppState from 'i2web/plugins/get-app-state';
import Device from 'i2web/models/device';
import Scheduler from 'i2web/models/scheduler';
import SchedulerConfig from 'config/schedulers';
import irrigationSchedulersFor from 'i2web/components/schedule/irrigation-schedulers';
import view from './edit-panel.stache';

const ANALYTICS_TAGS = {
  dev: 'devices.schedule.event.add',
  rule: 'rules.schedule.event.add',
  scene: 'scenes.schedule.event.add',
};

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Object} configuration
     * @parent i2web/components/schedule/edit-panel
     * @description The scheduler configuration object specific to the type of 'thing'
     */
    configuration: {
      get() {
        if (this.attr('thing')) {
          const type = this.attr('thing.base:type');
          if (type !== 'dev') {
            return SchedulerConfig[type];
          }

          // look up the config key from the device configuration
          if (SchedulerConfig.dev.hasOwnProperty(this.attr('thing.web:dev:scheduleConfig'))) {
            return SchedulerConfig.dev[this.attr('thing.web:dev:scheduleConfig')];
          }
        }
        return {};
      },
    },
    /**
     * @property {Number} intervalDuration
     * @parent i2web/components/schedule/edit-panel
     * @description The duration of an irrigation controller in INTERVAL mode.
     * Used to provide the User with a select element to update the duration
     */
    intervalDuration: {
      get() {
        const subsystem = this.attr('subsystem');
        const thing = this.attr('thing');
        const interval = subsystem.attr(`sublawnngarden:intervalSchedules.${thing.attr('base:address')}`);
        return interval.attr('days') || 1;
      },
      set(days) {
        const subsystem = this.attr('subsystem');
        const thing = this.attr('thing');
        const interval = subsystem.attr(`sublawnngarden:intervalSchedules.${thing.attr('base:address')}`);
        interval.attr('days', days);
        return days;
      },
    },
    /**
     * @property {Boolean} irrigationSchedule
     * @parent i2web/components/schedule/edit-panel
     * @decription Based on the scheduler object passed in, is this an
     * irrigation schedule, or a SchedulerService schedule?
     */
    irrigationSchedule: {
      get() {
        const thing = this.attr('thing');
        return thing instanceof Device && thing.hasCapability('irrsched');
      },
    },
    /**
     * @property {Scheduler} scheduler
     * @parent i2web/components/schedule/edit-panel
     * @description The scheduler for a particular thing
     */
    scheduler: {
      Type: Scheduler,
    },
    /**
     * @property {Model} thing
     * @parent i2web/components/schedule/edit-panel
     * @description The "thing" (scene, rule, device) being scheduled
     */
    thing: {
      type: '*',
    },
    /**
     * @property {String} thingName
     * @parent i2web/components/schedule/edit-panel
     * @description The name of the "thing" (scene, rule)
     */
    thingName: {
      type: 'string',
      get() {
        const thing = this.attr('thing');
        if (thing) {
          return thing.attr('rule:name')
            || thing.attr('scene:name')
            || thing.attr('dev:name')
            || '';
        }
        return '';
      },
    },
    /**
     * @property {Boolean} panelExpanded
     * @parent i2web/components/schedule/edit-panel
     * @description Whether the side panel is double width
     */
    panelExpanded: {
      type: 'boolean',
      value: false,
      set(expanded) {
        $('.panel-container')[(expanded) ? 'addClass' : 'removeClass']('is-double');
        return expanded;
      },
    },
    /**
     * @property {canMap} event
     * @parent i2web/components/schedule/edit-panel
     * @description The selected event
     */
    event: {
      Type: canMap,
      set(event) {
        this.attr('panelExpanded', !!event);

        if (event && this.attr('configuration')) {
          const attributes = this.attr('thing.base:type') === 'dev'
            ? _.pick(this.attr('thing'), this.attr('configuration').readOnlyAttributes)
            : {};

          if (!event.attr('attributes')) event.attr('attributes', {});
          event.attr('attributes').attr(_.pickBy(attributes, a => !!a)); // strip all the undefined properties
        }

        return event;
      },
    },
    /**
     * @property {Boolean} showCalendar
     * @parent i2web/components/schedule/edit-panel
     * @description Do not show the calendar for any irrigation devices that
     * have a mode of interval, even, and odd
     */
    showCalendar: {
      get() {
        if (this.attr('irrigationSchedule')) {
          return this.attr('selectedMode') === 'WEEKLY';
        }
        return true;
      },
    },
    /**
     * @property {canMap} showFollowSchedule
     * @parent i2web/components/schedule/edit-panel
     * @description The flag to show/hide Follow Schedule switch.
     */
    showFollowSchedule: {
      get() {
        return this.attr('scheduler.hasCommands')
          && this.attr('thing.base:type') !== 'rule'
          && this.attr('thing.dev:devtypehint') !== 'Irrigation';
      },
    },
    /**
     * @property {String} notFollowedInstructions
     * @parent i2web/components/schedule/edit-panel
     * @description The instructional text displayed when the schedule is no longer followed
     */
    notFollowedWarning: {
      get() {
        return (this.attr('thing.base:type') === 'dev')
          ? 'The Schedule for this Device is off.'
          : 'Without an active schedule, the Scene can only be triggered manually or by a Rule.';
      },
    },
    /**
     * @property {string} selectedMode
     * @parent i2web/components/schedule/edit-panel
     * @description A mode we handle schedules for. This might be a device mode
     * such as on thermostats.
     */
    selectedMode: {
      type: 'string',
      set(selectedMode) {
        this.attr('event', undefined);
        const thing = this.attr('thing');
        if (this.attr('irrigationSchedule')) {
          const schedulers = irrigationSchedulersFor(thing, selectedMode);
          this.attr('scheduler', schedulers[0]);
        }
        return selectedMode;
      },
    },
    /**
     * @property {boolean} isScheduleFollowed
     * @parent i2web/components/schedule/edit-panel
     * @description Whether or not the schedule is followed. Utilizes the scheduler for everything
     * but thermostats which need to utilize the climate subsystem.
     */
    isScheduleFollowed: {
      get() {
        return this.attr('scheduler.isFollowed');
      },
    },
    /**
     * @property {boolean} validModeSelected
     * @parent i2web/components/schedule/edit-panel
     * @description Whether or not a valid mode is selected
     */
    validModeSelected: {
      get(lastSetVal) {
        if (lastSetVal !== undefined) return lastSetVal;
        const modes = this.attr('configuration').modes && this.attr('configuration').modes.options;
        return (modes && modes.includes(this.attr('selectedMode'))) || !modes;
      },
    },
    /**
     * @property {boolean} canAddEvent
     * @parent i2web/components/schedule/edit-panel
     * @description Whether or not we can add events
     */
    canAddEvent: {
      get() {
        return !this.attr('event') && this.attr('validModeSelected');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/schedule/edit-panel
     * @description The subsystem for the device as specified by the schedule
     * configuration
     */
    subsystem: {
      get() {
        const subsystem = this.attr('configuration').subsystem;
        if (subsystem) {
          return getAppState().attr('subsystems').findByName(subsystem);
        }
        return undefined;
      },
    },
  },
  /**
   * @function addEvent
   * Open the right panel to start the process to add an event to
   * the current scheduler.
   */
  addEvent() {
    if (this.attr('configuration')) {
      this.tagAddEvent();

      const messageType = this.attr('thing.base:type') === 'rule'
        ? this.attr('configuration').messageType[0] // for rules, default to 'rule:Enable'
        : this.attr('configuration').messageType;

      const attributes = this.attr('thing.base:type') === 'dev'
        ? _.pick(this.attr('thing'), this.attr('configuration').attributes)
        : {};

      const selectedMode = this.attr('selectedMode');
      let scheduleId = this.attr('configuration').scheduleId;
      let configurator = this.attr('configuration').configurator;

      // If the scheduleId isn't a string, we should utilize the selectedMode
      // This is done for devices that can be scheduled with different modes
      // such as thermometers (e.g. AUTO, COOL, HEAT).
      if (typeof scheduleId !== 'string') {
        scheduleId = selectedMode;
        configurator = selectedMode;
      }

      this.attr('panelExpanded', true);
      if (!this.attr('irrigationSchedule')) {
        this.attr('event', {
          // strip all the undefined properties
          attributes: _.pickBy(attributes, a => !!a),
          days: [this.attr('selectedDay')],
          messageType,
          mode: 'ABSOLUTE',
          offsetMinutes: null,
          // https://eyeris.atlassian.net/wiki/pages/viewpage.action?pageId=68812847
          scheduleId,
          configurator,
          time: moment(new Date()).format('HH:00:00'),
        });
      } else {
        this.attr('event', {
          controller: this.attr('thing.base:address'),
          days: [],
          eventId: null,
          intervalDuration: this.attr('intervalDuration'),
          mode: this.attr('selectedMode'),
          timeOfDay: moment(new Date()).format('HH:00:00'),
          zoneDurations: [],
        });
      }
    }
  },
  /**
   * @function tagAddEvent
   * Analytics tagging for Add Event button click
   */
  tagAddEvent() {
    const type = this.attr('thing.base:type');
    const tagName = ANALYTICS_TAGS[type];
    if (tagName) {
      Analytics.tag(tagName);
    }
  },
  /**
   * @function toggleSchedule
   * Toggles whether or not the scheduler should be enabled or not.
   */
  toggleSchedule() {
    const thing = this.attr('thing');
    const scheduler = this.attr('scheduler');
    const isFollowed = this.attr('isScheduleFollowed');

    // things that have the `therm` capability should utilize the climate subsystem to enable
    // and disable their scheduler
    if (thing.hasCapability && thing.hasCapability('therm')) {
      const climateSubsystem = getAppState().attr('subsystems').findByName('subclimate');

      climateSubsystem[isFollowed ? 'DisableScheduler' : 'EnableScheduler'](thing.attr('base:address'));
    } else {
      scheduler.toggleFollowSchedule();
    }
  },
});

export default Component.extend({
  tag: 'arcus-schedule-edit-panel',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel.subsystem} base:ValueChange': function subsystemValueChange() {
      const vm = this.viewModel;
      const thing = vm.attr('thing');
      const mode = vm.attr('selectedMode');
      if (vm.attr('irrigationSchedule')) {
        const schedulers = irrigationSchedulersFor(thing, mode);
        vm.attr('scheduler', schedulers[0]);
      }
    },
  },
});
