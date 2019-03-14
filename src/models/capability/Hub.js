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
 * @module {Object} i2web/models/Hub Hub
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} hub\:name
     *
     * Human readable name for the hub
     *
     */
    'hub:name',
    /**
     * @property {uuid} hub\:image
     *
     * Media URL to image that represents the hub
     *
     */
    'hub:image',
    /**
     * @property {string} hub\:tz
     *
     * The timezone for the hub.
     *
     */
    'hub:tz',
  ],
  methods: {
    /**
     * @function PairingRequest
     *
     * Lists all devices associated with this account
     *
     * @param {enum} actionType Whether pairing should start or stop
     * @param {long} timeout The amount of time in milliseconds for which the place will be able to add devices
     * @param {string} [productPairingMode] If there is a special pairing mode required for this pairing attempt as indicated by the pairingMode attribute of the product in the product catalog such as ZBCLEAR for clear text pairing in Zigbee needed for AlertMe devices
     * @return {Promise}
     */
    PairingRequest(actionType, timeout, productPairingMode) {
      return Bridge.request('hub:PairingRequest', this.GetDestination(), {
        actionType,
        timeout,
        productPairingMode,
      });
    },
    /**
     * @function UnpairingRequest
     *
     * Lists all devices associated with this account
     *
     * @param {enum} actionType Whether pairing should start or stop
     * @param {long} timeout The amount of time in milliseconds for which the place will be able to add devices.
     * @param {string} [protocol] The namespace of the protocol of the device expected to be removed. By default no device is expected to be removed.
     * @param {string} [protocolId] The protocolId of the device expected to be removed. By default no device is expected to be removed.
     * @param {boolean} [force] True if the expected device is to be forcefully unpaired. Defaults to false.
     * @return {Promise}
     */
    UnpairingRequest(actionType, timeout, protocol, protocolId, force) {
      return Bridge.request('hub:UnpairingRequest', this.GetDestination(), {
        actionType,
        timeout,
        protocol,
        protocolId,
        force,
      });
    },
    /**
     * @function ListHubs
     *
     * Lists all hubs associated with this account
     *
     * @return {Promise}
     */
    ListHubs() {
      return Bridge.request('hub:ListHubs', this.GetDestination(), {});
    },
    /**
     * @function ResetLogLevels
     *
     * Resets all log levels to their normal values.
     *
     * @return {Promise}
     */
    ResetLogLevels() {
      return Bridge.request('hub:ResetLogLevels', this.GetDestination(), {});
    },
    /**
     * @function SetLogLevel
     *
     * Sets the log level of for the specified scope, or the root log level if no scope is specified.
     *
     * @param {enum} level The log level to set the scope to use
     * @param {enum} [scope] The logging scope affected by the log level, ROOT if none is specified.
     * @return {Promise}
     */
    SetLogLevel(level, scope) {
      return Bridge.request('hub:SetLogLevel', this.GetDestination(), {
        level,
        scope,
      });
    },
    /**
     * @function GetLogs
     *
     * Gets recent logs from the hub.
     *
     * @return {Promise}
     */
    GetLogs() {
      return Bridge.request('hub:GetLogs', this.GetDestination(), {});
    },
    /**
     * @function StreamLogs
     *
     * Starts streaming logs to the platform for the specified amount of time.
     *
     * @param {long} duration The amount of time to stream logs in milliseconds.
     * @param {enum} [severity] The log severity and higher that should be streamed.
     * @return {Promise}
     */
    StreamLogs(duration, severity) {
      return Bridge.request('hub:StreamLogs', this.GetDestination(), {
        duration,
        severity,
      });
    },
    /**
     * @function GetConfig
     *
     * Gets all key/value pairs describing the hub&#x27;s configuration.
     *
     * @param {boolean} [defaults] A flag indicating if default values should be reported.
     * @param {string} [matching] A regular expression used to select keys to include in the response.
     * @return {Promise}
     */
    GetConfig(defaults, matching) {
      return Bridge.request('hub:GetConfig', this.GetDestination(), {
        defaults,
        matching,
      });
    },
    /**
     * @function SetConfig
     *
     * Gets all key/value pairs describing the hub&#x27;s configuration.
     *
     * @param {map<string>} config Key/value pairs to set in the hub configuration.
     * @return {Promise}
     */
    SetConfig(config) {
      return Bridge.request('hub:SetConfig', this.GetDestination(), {
        config,
      });
    },
    /**
     * @function Delete
     *
     * Remove/Deactivate the hub.
     *
     * @return {Promise}
     */
    Delete() {
      return Bridge.request('hub:Delete', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onHubConnected
     *
     * Sent when a hub comes online.  This may be very specific to the given protocol and require client interpretation.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onHubConnected(callback) {
      Cornea.on('hub hub:HubConnected', callback);
    },
    /**
     * @function onHubDisconnected
     *
     * Sent when a hub goes offline.  This may be very specific to the given protocol and require client interpretation.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onHubDisconnected(callback) {
      Cornea.on('hub hub:HubDisconnected', callback);
    },
    /**
     * @function onDeviceFound
     *
     * Indicates that a device has been found during the pairing process.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeviceFound(callback) {
      Cornea.on('hub hub:DeviceFound', callback);
    },
  },
  STATE_NORMAL: 'NORMAL',
  STATE_PAIRING: 'PAIRING',
  STATE_UNPAIRING: 'UNPAIRING',
  STATE_DOWN: 'DOWN',
  REGISTRATIONSTATE_REGISTERED: 'REGISTERED',
  REGISTRATIONSTATE_UNREGISTERED: 'UNREGISTERED',
  REGISTRATIONSTATE_ORPHANED: 'ORPHANED',
};
