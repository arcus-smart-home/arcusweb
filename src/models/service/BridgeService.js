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

/**
 * @module {Object} i2web/models/BridgeService BridgeService
 * @parent app.models.services
 *
 * Bridge Service for the mgt of bridge devices
 */
export default {
  /**
   * @function RegisterDevice
   *
   * Assigns a place to the device with the specified id provided the device is online.
   *
   * @param {map<string>} attrs Identifying attributes of the device.
   * @return {Promise}
   */
  RegisterDevice(attrs) {
    return Bridge.request('bridgesvc:RegisterDevice', 'SERV:bridgesvc:', {
      attrs,
    });
  },
  /**
   * @function RemoveDevice
   *
   * Removes the device with the specified id.
   *
   * @param {string} id The identifier for the device.
   * @param {string} [accountId] The account id of the device
   * @param {string} [placeId] The place id of the device
   * @return {Promise}
   */
  RemoveDevice(id, accountId, placeId) {
    return Bridge.request('bridgesvc:RemoveDevice', 'SERV:bridgesvc:', {
      id,
      accountId,
      placeId,
    });
  },
};
