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

import Component from 'can-component';
import CanMap from 'can-map';
import 'can-map-define';
import view from './schedule.stache';
import Device from 'i2web/models/device';
import Errors from 'i2web/plugins/errors';
import Scheduler from 'i2web/models/scheduler';
import SchedulerService from 'i2web/models/service/SchedulerService';
import SidePanel from 'i2web/plugins/side-panel';
import schedulersFor from 'i2web/components/schedule/device-schedulers';
import Notifications from 'i2web/plugins/notifications';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Object} customizationStep
     * @parent i2web/components/pairing/customize/schedule
     * @description Customization step that contains display text
     */
    customizationStep: {
      type: '*',
    },
    /**
     * @property {string} subtitle
     * @parent i2web/components/pairing/customize/schedule
     * @description The subtitle for the customization panel
     */
    subtitle: {
      type: 'string',
      get() {
        const step = this.attr('customizationStep');
        return step && step.title ? step.title : 'Set a Schedule';
      },
    },
    /**
     * @property {string} subcopy
     * @parent i2web/components/pairing/customize/schedule
     * @description The subcopy for the panel.
     */
    description: {
      type: 'string',
      get() {
        const step = this.attr('customizationStep');
        if (step && step.description && step.description.length > 0) {
          return step.description;
        }
        return ['Set up a schedule to automate your device while you are away from home.'];
      },
    },
    /**
     * @property {string} buttonLabel
     * @parent i2web/components/pairing/customize/schedule
     * @description The label for editing / managing schedule for a device
     */
    buttonLabel: {
      type: 'string',
      get() {
        // thermostats have a default schedule and should show different text
        // consider generalizing this and checking for the default schedule instead
        if (this.attr('device.therm:hvacmode') !== undefined) {
          return 'Edit Schedule';
        }

        return 'Set a Schedule';
      },
    },
    /**
     * @property {Object} scheduler
     * @parent i2web/components/pairing/customize/schedule
     * @description The scheduler object for the given device
     */
    scheduler: {
      Type: Scheduler,
      get(currentVal, setVal) {
        const schedulers = schedulersFor(this.attr('device'));
        if (schedulers.attr('length') !== 0) {
          return schedulers[0];
        }

        // if there is no existing schedule, create a new one
        if (this.attr('device')) {
          SchedulerService.GetScheduler(this.attr('device').attr('base:address'))
            .then(({ scheduler }) => { setVal(scheduler); })
            .catch((e) => {
              setVal(undefined);
              Errors.log(e, true);
            });
        }

        return undefined;
      },
    },
    /**
     * @property {Device} device
     * @parent i2web/components/pairing/customize/schedule
     * @description The device for which we are customizing the schedule
     */
    device: {
      Type: Device,
    },
    /**
     * @property {String} title
     * @parent i2web/components/pairing/customize/schedule
     * @description Header field from the customization step, to be displayed as the primary
     * title directly below the staged progress bar.
     */
    title: {
      value: 'Advanced Automation',
    },
    /**
     * @property {*} whenComplete
     * @parent i2web/components/pairing/customize/schedule
     * @description Accept a whenComplete method as an optional parameter for the component; if specified, invoke this method when a schedule event is added (this method should ultimately be used to call PairingDeviceCapability.AddCustomization('SCHEDULE') )
     */
    whenComplete: {},
  },
  /**
   * @function editSchedule
   * Edit the schedule of a particular device
   */
  editSchedule() {
    SidePanel.right('<arcus-schedule-edit-panel {thing}="thing" {scheduler}="scheduler" />', {
      scheduler: this.compute('scheduler'),
      thing: this.compute('device'),
    });
  },
});

export default Component.extend({
  tag: 'arcus-pairing-customize-schedule',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel.scheduler} commandsByDay': function scheduleAdded() {
      const vm = this.viewModel;
      if (vm.attr('whenComplete')) {
        vm.attr('whenComplete')('SCHEDULE');
      }
      Notifications.success('Your Event has been created.', 'icon-app-calendar-1');
    },
  },
});
