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
import canDev from 'can-util/js/dev/';
import 'can-map-define';
import view from './card.stache';
import AlarmSubsystemCapability from 'i2web/models/capability/AlarmSubsystem';
import getAppState from 'i2web/plugins/get-app-state.js';
import Subsystem from 'i2web/models/subsystem';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {CanList} devices
     * @parent i2web/components/subsystem/alarms/card
     * @description The place's device list
     */
    devices: {
      get() {
        return getAppState().attr('devices');
      },
    },
    /**
     * @property {Hub} hub
     * @parent i2web/components/subsystem/alarms/card
     * @description The place's hub
     */
    hub: {
      get() {
        return getAppState().attr('hub');
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/alarms/card
     * @description The currently active place
     */
    place: {
      get() {
        return getAppState().attr('place');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/alarms/card
     * @description The associated subsystem, this should be a subsystem with the subalarm capability
     */
    subsystem: {
      Type: Subsystem,
      set(subsystem) {
        if (!subsystem.hasCapability('subalarm')) {
          canDev.warn(`Subsystem does not have subalarm capability - perhaps subsystem instantiated incorrectly?`);
        }
        return subsystem;
      },
    },
    /**
     * @property {Incident} currentIncident
     * @parent i2web/components/subsystem/alarms/card
     * @description The currently alerting incident
     */
    currentIncident: {
      get() {
        return getAppState().attr('currentIncident');
      },
    },
    /**
     * @property {boolean} hasAvailableAlerts
     * @parent i2web/components/subsystem/alarms/card
     * @description Indicates whether the subsystem alarm has any available alerts
     */
    hasAvailableAlerts: {
      type: 'boolean',
      get() {
        const alertsAvailable = this.attr('subsystem.subalarm:availableAlerts.length');
        return alertsAvailable > 0;
      },
    },
    /**
     * @property {boolean} hubAlarmProviderOffline
     * @parent i2web/components/subsystem/alarms/card
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
     * @parent i2web/components/subsystem/alarms/card
     * @description Indicates whether the hub or device that raises alarms is offline
     */
    isAlarmProviderOffline: {
      type: 'boolean',
      get() {
        return this.attr('hubAlarmProviderOffline') || this.attr('swannAlarmProviderOffline');
      },
    },
    /**
     * @property {boolean} swannAlarmProviderOffline
     * @parent i2web/components/subsystem/alarms/card
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
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-card-alarms',
  viewModel: ViewModel,
  view,
});
