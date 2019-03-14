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
import Device from 'i2web/models/device';
import Errors from 'i2web/plugins/errors';
import view from './settings.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/doors-locks/settings
     * @description The doors and locks subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {Object} chimeConfig
     * @parent i2web/components/subsystem/doors-locks/settings
     * @description Config object representing each device and chime status
     */
    chimeConfig: {
      get() {
        return this.attr('subsystem.subdoorsnlocks:chimeConfig');
      },
    },
    /**
     * @property {canMap} devices
     * @parent i2web/components/subsystem/doors-locks/settings
     * @description A map of device and status
     */
    devices: {
      get() {
        const chimeConfig = this.attr('chimeConfig');
        const devices = chimeConfig.map((config) => {
          return {
            device: new Device({ 'base:address': config.attr('device') }),
            enabled: config.attr('enabled'),
          };
        }).sort((a, b) => {
          return (a.device.attr('dev:name') > b.device.attr('dev:name')) ? 1 : -1;
        });
        return devices;
      },
    },
    /**
     * @property {Boolean} hasConfigurableDevices
     * @parent i2web/components/subsystem/doors-locks/settings
     * @description Boolean indicating if there are any devices to configure
     */
    hasConfigurableDevices: {
      get() {
        const devices = this.attr('devices');
        return devices && devices.length;
      },
    },
  },
  /**
   * @function toggleState
   *
   * Changes the state of chime for a particular device
   *
   */
  toggleState(controlSwitchVM) {
    const chime = controlSwitchVM.attr('toggleAttribute');
    const chimeConfig = this.attr('chimeConfig').map((config) => {
      if (config.device === chime.device.attr('base:address')) {
        config.enabled = !chime.enabled;
      }
      return {
        device: config.device,
        enabled: config.enabled,
      };
    });
    const subsystem = this.attr('subsystem');
    subsystem.attr('subdoorsnlocks:chimeConfig', chimeConfig);
    subsystem.save().catch(e => Errors.log(e));
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-doors-locks-settings',
  viewModel: ViewModel,
  view,
});
