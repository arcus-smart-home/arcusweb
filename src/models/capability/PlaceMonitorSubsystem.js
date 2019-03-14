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
 * @module {Object} i2web/models/PlaceMonitorSubsystem PlaceMonitorSubsystem
 * @parent app.models.capabilities
 *
 * Place Monitor subsystem.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function RenderAlerts
     *
     * Renders all alerts
     *
     * @return {Promise}
     */
    RenderAlerts() {
      return Bridge.request('subplacemonitor:RenderAlerts', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onHubOffline
     *
     * Sent when a hub is offline for a specified measure of time.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onHubOffline(callback) {
      Cornea.on('subplacemonitor subplacemonitor:HubOffline', callback);
    },
    /**
     * @function onHubOnline
     *
     * Sent when a hub comes back online after being offline for a specified measure of time.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onHubOnline(callback) {
      Cornea.on('subplacemonitor subplacemonitor:HubOnline', callback);
    },
    /**
     * @function onDeviceOffline
     *
     * Sent when a device is offline for a specified measure of time.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeviceOffline(callback) {
      Cornea.on('subplacemonitor subplacemonitor:DeviceOffline', callback);
    },
    /**
     * @function onDeviceOnline
     *
     * Sent when a device comes back online after being offline for a specified measure of time.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeviceOnline(callback) {
      Cornea.on('subplacemonitor subplacemonitor:DeviceOnline', callback);
    },
  },
  PAIRINGSTATE_PAIRING: 'PAIRING',
  PAIRINGSTATE_UNPAIRING: 'UNPAIRING',
  PAIRINGSTATE_IDLE: 'IDLE',
  PAIRINGSTATE_PARTIAL: 'PARTIAL',
};
