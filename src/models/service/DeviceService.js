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
 * @module {Object} i2web/models/DeviceService DeviceService
 * @parent app.models.services
 *
 * Entry points for the device service, which covers global operations on devices not handled by the device object capabilities.
 */
export default {
  /**
   * @function onDevicesDegraded
   *
   * Emitted by the hub to driver services when the hub detects that the degraded state of some devices has changed
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onDevicesDegraded(callback) {
    Cornea.on('dev dev:DevicesDegraded', callback);
  },
  /**
   * @function SyncDevices
   *
   * A request to synchronize the hub local reflexes with device services
   *
   * @param {string} accountId The account identifier of the hub requesting synchronization
   * @param {string} placeId The place identifier of the hub requesting synchronization
   * @param {int} reflexVersion The version of hub local reflexes currently supported by the hub
   * @param {string} devices A base64 encoded and gzipped json list of SyncDeviceInfo objects
   * @return {Promise}
   */
  SyncDevices(accountId, placeId, reflexVersion, devices) {
    return Bridge.request('dev:SyncDevices', 'SERV:dev:', {
      accountId,
      placeId,
      reflexVersion,
      devices,
    });
  },
};
