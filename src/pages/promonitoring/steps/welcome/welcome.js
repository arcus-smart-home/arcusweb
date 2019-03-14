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
import 'can-map-define';
import 'can-construct-super';
import canDev from 'can-util/js/dev/';
import Device from 'i2web/models/device';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import view from './welcome.stache';

import 'i2web/helpers/global';
import getAppState from 'i2web/plugins/get-app-state';

/**
 * @module {canMap} i2web/pages/promonitoring/steps/welcome Welcome
 * @parent i2web/pages/promonitoring
 * @description ProMonitoring Signup Welcome Step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
      set(settings) {
        if (this.attr('devices')) {
          settings.CheckSensors().then((response) => {
            if (response.offline) {
              const offlineDevices = this.attr('devices').filter((device) => {
                return _.find(response.offline, (addr) => {
                  return addr === device.attr('base:address');
                });
              });
              this.attr('offlineDevices', offlineDevices);
            }
          }).catch(e => canDev.warn(e.message));
        }
        return settings;
      },
    },
    /**
     * @property {String} contextHeader
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description The header to show in the grey context bar
     */
    contextHeader: {
      type: 'string',
      value: 'Welcome to Professional Monitoring',
    },
    /**
     * @property {string} monitoringStationNumber
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description The phone number for the central Monitoring Station
     */
    monitoringStationNumber: {
      value() {
        return getAppState().attr('monitoringStationNumber');
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description The current place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Device.List} devices
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description All devices associated with the current place
     */
    devices: {
      Type: Device.List,
    },
    /**
     * @property {Device.List} devices
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description The filtered list of offline devices at the user's currently selected place.
     */
    offlineDevices: {
      Type: Device.List,
    },
    /**
     * @property {Boolean} hideOfflineDevices
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description Whether we should hide the Offline Devices section
     */
    hideOfflineDevices: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} hideTutorials
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description Whether we should hide the Tutorials section
     */
    hideTutorials: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Person.List} people
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description All people tied to the current place
     */
    people: {
      Type: Person.List,
    },
    /**
     * @property {Person.List} notificationList
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description List of people who are enabled on the alarm notification call tree
     */
    notificationList: {
      get() {
        const subsystems = getAppState().attr('subsystems');
        const subsystem = subsystems && subsystems.findByName('subalarm');
        if (subsystem && subsystem.attr('subalarm:callTree') && this.attr('people')) {
          const callTree = new Person.List();
          subsystem.attr('subalarm:callTree').filter(callee => callee.enabled).forEach((callee) => {
            callTree.push(_.find(this.attr('people'), (person) => { return callee.person === person.attr('base:address'); }));
          });
          return callTree;
        }
        return undefined;
      },
    },
    /**
     * @property {boolean} notificationsSufficient
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description Returns true if number of people on the notification call tree is sufficient
     */
    notificationsSufficient: {
      get() {
        return this.attr('notificationList') && this.attr('notificationList').attr('length') > 1;
      },
    },
    /**
     * @property {boolean} hasNoNav
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description Disables navigation
     */
    hasNoNav: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {boolean} bypass
     * @parent i2web/pages/promonitoring/steps/welcome
     * @description This step can never be bypassed
     */
    bypass: {
      type: 'boolean',
      value: 'false',
    },
  },
});

export default StepComponent.extend({
  tag: 'arcus-pro-monitoring-step-welcome',
  viewModel: ViewModel,
  view,
});
