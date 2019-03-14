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
 * @module {Object} i2web/models/DeviceOta DeviceOta
 * @parent app.models.capabilities
 *
 * Capabilities for devices that support over the air firmware updates.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function FirmwareUpdate
     *
     * Requests that the hub update its firmware
     *
     * @param {string} url The URL of the firmware.
     * @param {enum} [priority] The priority of the firmware update. Updates at NORMAL priority may be refused in some senarios.
     * @param {string} [md5] An MD5 of the firmware if devices require it for validation of the download.
     * @return {Promise}
     */
    FirmwareUpdate(url, priority, md5) {
      return Bridge.request('devota:FirmwareUpdate', this.GetDestination(), {
        url,
        priority,
        md5,
      });
    },
    /**
     * @function FirmwareUpdateCancel
     *
     * Requests that the hub cancel an existing firmware update
     *
     * @return {Promise}
     */
    FirmwareUpdateCancel() {
      return Bridge.request('devota:FirmwareUpdateCancel', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onFirmwareUpdateProgress
     *
     * Sent when a device has been removed for any reason. This may be very specific to the given protocol and require client interpretation.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onFirmwareUpdateProgress(callback) {
      Cornea.on('devota devota:FirmwareUpdateProgress', callback);
    },
  },
  STATUS_IDLE: 'IDLE',
  STATUS_INPROGRESS: 'INPROGRESS',
  STATUS_COMPLETED: 'COMPLETED',
  STATUS_FAILED: 'FAILED',
};
