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
import Subsystem from 'i2web/models/subsystem';
import view from './status.stache';
import Device from 'i2web/models/device';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/doors-locks/status
     * @description The doors and locks subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {canList} locks
     * @parent i2web/components/subsystem/doors-locks/status
     * @description List of lock devices
     */
    locks: {
      Type: Device.List,
      get() {
        if (this.attr('subsystem')) {
          return this.attr('subsystem.subdoorsnlocks:lockDevices').map((device) => {
            return new Device({ 'base:address': device });
          }).sort((a, b) => {
            return (a.attr('dev:name') > b.attr('dev:name')) ? 1 : -1;
          });
        }
        return [];
      },
    },
    /**
     * @property {canList} doors
     * @parent i2web/components/subsystem/doors-locks/status
     * @description List of door devices
     */
    doors: {
      Type: Device.List,
      get() {
        const getDevice = (deviceId => new Device({ 'base:address': deviceId }));
        if (this.attr('subsystem')) {
          const contactSensorDevices = this.attr('subsystem.subdoorsnlocks:contactSensorDevices').map(getDevice);
          const motorizedDoorDevices = this.attr('subsystem.subdoorsnlocks:motorizedDoorDevices').map(getDevice);
          const petDoorDevices = this.attr('subsystem.subdoorsnlocks:petDoorDevices').map(getDevice);

          return contactSensorDevices.concat(motorizedDoorDevices, petDoorDevices).sort((a, b) => {
            return (a.attr('dev:name') > b.attr('dev:name')) ? 1 : -1;
          });
        }
        return [];
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-doors-locks-status',
  viewModel: ViewModel,
  view,
});
