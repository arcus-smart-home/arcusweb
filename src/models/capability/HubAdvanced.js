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
 * @module {Object} i2web/models/HubAdvanced HubAdvanced
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function Restart
     *
     * Restarts the Arcus Agent
     *
     * @return {Promise}
     */
    Restart() {
      return Bridge.request('hubadv:Restart', this.GetDestination(), {});
    },
    /**
     * @function Reboot
     *
     * Reboots the hub
     *
     * @return {Promise}
     */
    Reboot() {
      return Bridge.request('hubadv:Reboot', this.GetDestination(), {});
    },
    /**
     * @function FirmwareUpdate
     *
     * Requests that the hub update its firmware
     *
     * @param {string} url The URL of the firmware
     * @param {enum} [priority] The urgency of the upgrade.  NORMAL is whenever next cycles permit.  URGENT means now.  BELOW_MINIMUM is indicates that the current firmware is below platform min and to upgrade immediately.
     * @param {enum} type The type of firmware being updated.
     * @param {boolean} [showLed] Whether to show the LED for firmware update or not.
     * @return {Promise}
     */
    FirmwareUpdate(url, priority, type, showLed) {
      return Bridge.request('hubadv:FirmwareUpdate', this.GetDestination(), {
        url,
        priority,
        type,
        showLed,
      });
    },
    /**
     * @function FactoryReset
     *
     * Request to tell the hub to factory reset.  This should remove all personal data from the hub
     *
     * @return {Promise}
     */
    FactoryReset() {
      return Bridge.request('hubadv:FactoryReset', this.GetDestination(), {});
    },
    /**
     * @function GetKnownDevices
     *
     * Get a list of known device protocol addresses.
     *
     * @param {set<string>} protocols The set of protocols that should be returned
     * @return {Promise}
     */
    GetKnownDevices(protocols) {
      return Bridge.request('hubadv:GetKnownDevices', this.GetDestination(), {
        protocols,
      });
    },
    /**
     * @function GetDeviceInfo
     *
     * Get a list of known device protocol addresses.
     *
     * @param {string} protocolAddress The protocol address of the device to get the device information from.
     * @return {Promise}
     */
    GetDeviceInfo(protocolAddress) {
      return Bridge.request('hubadv:GetDeviceInfo', this.GetDestination(), {
        protocolAddress,
      });
    },
  },
  events: {
    /**
     * @function onFirmwareUpgradeProcess
     *
     * Sent when a hub comes online.  This may be very specific to the given protocol and require client interpretation.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onFirmwareUpgradeProcess(callback) {
      Cornea.on('hubadv hubadv:FirmwareUpgradeProcess', callback);
    },
    /**
     * @function onDeregister
     *
     * Event sent from the platform to the hub informing it that it needs to deregister (boot all devices and factory reset)
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeregister(callback) {
      Cornea.on('hubadv hubadv:Deregister', callback);
    },
    /**
     * @function onStartUploadingCameraPreviews
     *
     * Event sent from the platform to the hub informing it that it should start uploading camera preview snapshots up to the server.
If the hub is already publishing snapshots, it should increment some counter for the number of requests it has received but not start new uploads so
when StopCameraPreviews is issued it will know when it is safe to stop uploading.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onStartUploadingCameraPreviews(callback) {
      Cornea.on('hubadv hubadv:StartUploadingCameraPreviews', callback);
    },
    /**
     * @function onStopUploadingCameraPreviews
     *
     * Event sent from the platform to the hub informing it to stop uploading camera previews.  This should decrement the counter of the
PublishCameraPreviews (to account for multiple user sessions) and when it is zero should stop uploading.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onStopUploadingCameraPreviews(callback) {
      Cornea.on('hubadv hubadv:StopUploadingCameraPreviews', callback);
    },
    /**
     * @function onUnpairedDeviceRemoved
     *
     * Event sent when an unpaired or unvetted device is removed from the hub.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onUnpairedDeviceRemoved(callback) {
      Cornea.on('hubadv hubadv:UnpairedDeviceRemoved', callback);
    },
    /**
     * @function onAttention
     *
     * An event indicating that a hub needs attention
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onAttention(callback) {
      Cornea.on('hubadv hubadv:Attention', callback);
    },
  },
  LASTRESTARTREASON_UNKNOWN: 'UNKNOWN',
  LASTRESTARTREASON_FIRMWARE_UPDATE: 'FIRMWARE_UPDATE',
  LASTRESTARTREASON_REQUESTED: 'REQUESTED',
  LASTRESTARTREASON_SOFT_RESET: 'SOFT_RESET',
  LASTRESTARTREASON_FACTORY_RESET: 'FACTORY_RESET',
  LASTRESTARTREASON_GATEWAY_FAILURE: 'GATEWAY_FAILURE',
  LASTRESTARTREASON_MIGRATION: 'MIGRATION',
  LASTRESTARTREASON_BACKUP_RESTORE: 'BACKUP_RESTORE',
  LASTRESTARTREASON_WATCHDOG: 'WATCHDOG',
};
