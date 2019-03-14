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

import Cornea from 'i2web/cornea/';

/**
 * @module {Object} i2web/models/DeviceAdvanced DeviceAdvanced
 * @parent app.models.capabilities
 *
 * Advanced device capabilities shared by all devices.
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} devadv\:degradedCode
     *
     * The code string indicating the reason that a device is operating in a degraded manner.
     *
     */
    'devadv:degradedCode',
  ],
  methods: {
    /**
     * @function UpgradeDriver
     *
     * Upgrades the driver for this device to the driver specified.  If not specified it will look for the most current driver for this device.
     *
     * @param {string} [driverName] Optional driver name to upgrade this device to.  If specified driverVersion must also be provided.
     * @param {string} [driverVersion] Optional driver version to upgrade this device to.  If specified driverName must also be provided.
     * @return {Promise}
     */
    UpgradeDriver(driverName, driverVersion) {
      return Bridge.request('devadv:UpgradeDriver', this.GetDestination(), {
        driverName,
        driverVersion,
      });
    },
    /**
     * @function GetReflexes
     *
     * Gets the currently defined reflexes for the driver as a json object.
     *
     * @return {Promise}
     */
    GetReflexes() {
      return Bridge.request('devadv:GetReflexes', this.GetDestination(), {});
    },
    /**
     * @function Reconfigure
     *
     * Attempts to re-apply initial configuration for the device, this may leave it in an unusable state if it fails.
     *
     * @return {Promise}
     */
    Reconfigure() {
      return Bridge.request('devadv:Reconfigure', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onRemovedDevice
     *
     * Sent when a device has been removed for any reason. This may be very specific to the given protocol and require client interpretation.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onRemovedDevice(callback) {
      Cornea.on('devadv devadv:RemovedDevice', callback);
    },
  },
  DRIVERSTATE_CREATED: 'CREATED',
  DRIVERSTATE_PROVISIONING: 'PROVISIONING',
  DRIVERSTATE_ACTIVE: 'ACTIVE',
  DRIVERSTATE_UNSUPPORTED: 'UNSUPPORTED',
  DRIVERSTATE_RECOVERABLE: 'RECOVERABLE',
  DRIVERSTATE_UNRECOVERABLE: 'UNRECOVERABLE',
  DRIVERSTATE_TOMBSTONED: 'TOMBSTONED',
};
