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
import canMap from 'can-map';
import 'can-map-define';
import AlarmSubsystemCapability from 'i2web/models/capability/AlarmSubsystem';
import AppState from 'i2web/plugins/get-app-state';
import Subsystem from 'i2web/models/subsystem';
import view from './status.stache';
import { showAlarmNotification } from 'i2web/plugins/notification';

export const ViewModel = canMap.extend({
  define: {
    additionalAlerts: {
      get() {
        return this.attr('currentIncident.incident:additionalAlerts.length');
      },
    },
    /**
     * @property {Incident} currentIncident
     * @parent i2web/components/subsystem/alarms/status
     * @description The currently alerting incident
     */
    currentIncident: {
      get() {
        return AppState().attr('currentIncident');
      },
    },
    /**
     * @property {Place} currentPlace
     * @parent i2web/components/subsystem/alarms/status
     * @description The current place
     */
    currentPlace: {
      get() {
        return AppState().attr('place');
      },
    },
    /**
     * @property {CanList} devices
     * @parent i2web/components/subsystem/alarms/status
     * @description The place's device list
     */
    devices: {
      get() {
        return AppState().attr('devices');
      },
    },
    /**
     * @property {Hub} hub
     * @parent i2web/components/subsystem/alarms/status
     * @description The place's hub
     */
    hub: {
      get() {
        return AppState().attr('hub');
      },
    },
    /**
     * @property {boolean} hubAlarmProviderOffline
     * @parent i2web/components/subsystem/alarms/status
     * @description Indicates whether the hub is offline and it also provides local alarm services
     */
    hubAlarmProviderOffline: {
      type: 'boolean',
      get() {
        const hub = this.attr('hub');
        if (hub && hub.attr('isOffline') &&
          this.attr('subsystem.subalarm:alarmProvider') === AlarmSubsystemCapability.ALARMPROVIDER_HUB) {
          return true;
        }
        return false;
      },
    },
    /**
     * @property {boolean} isAlarmProviderOffline
     * @parent i2web/components/subsystem/alarms/status
     * @description Indicates whether the hub or device that raises alarms is offline
     */
    isAlarmProviderOffline: {
      type: 'boolean',
      get() {
        return this.attr('hubAlarmProviderOffline') || this.attr('swannAlarmProviderOffline');
      },
    },
    /**
     * @property {Subsystem} safetySubsystem
     * @parent i2web/components/subsystem/alarms/status
     * @description The safety subsystem, for smoke and co
     */
    safetySubsystem: {
      get() {
        const subsystems = AppState().attr('subsystems');
        return subsystems && subsystems.findByName('subsafety');
      },
    },
    /**
     * @property {Subsystem} securitySubsystem
     * @parent i2web/components/subsystem/alarms/status
     * @description The security subsystem
     */
    securitySubsystem: {
      get() {
        const subsystems = AppState().attr('subsystems');
        return subsystems && subsystems.findByName('subsecurity');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/alarms/status
     * @description The alarm subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {boolean} swannAlarmProviderOffline
     * @parent i2web/components/subsystem/alarms/status
     * @description Returns true if there is no hub, but there are Swann cameras and they are all offline.
     */
    swannAlarmProviderOffline: {
      get() {
        if (this.attr('hub')) return false;
        const devices = this.attr('devices');
        if (!(devices && devices.length)) return false;

        const swannCameras = devices.filter(d => d.attr('swannbatterycamera:sn'));
        if (!(swannCameras && swannCameras.length)) return false;

        const onlineSwanns = swannCameras.filter(d => !d.attr('isOffline'));
        return !(onlineSwanns && onlineSwanns.length);
      },
    },
    /**
     * @property {Subsystem} waterSubsystem
     * @parent i2web/components/subsystem/alarms/status
     * @description The water subsystem for any water leak sensors
     */
    waterSubsystem: {
      get() {
        const subsystems = AppState().attr('subsystems');
        return subsystems && subsystems.findByName('subwater');
      },
    },
  },
  /**
   * @function showNotification
   * @parent i2web/components/subsystem/alarms/status
   * @description Shows system notification for current incident type
   */
  showNotification() {
    showAlarmNotification(this.attr('currentPlace'), this.attr('currentIncident'));
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-alarms-status',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      if (this.viewModel.attr('currentIncident')) {
        this.viewModel.showNotification();
      }
    },
    '{viewModel} currentIncident': function onIncident() {
      this.viewModel.showNotification();
    },
    '{viewModel.currentIncident} incident:alert': function onIncident() {
      this.viewModel.showNotification();
    },
    '{viewModel} additionalAlerts': function onIncident() {
      this.viewModel.showNotification();
    },
  },
});
