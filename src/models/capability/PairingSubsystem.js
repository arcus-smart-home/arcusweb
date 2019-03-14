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
 * @module {Object} i2web/models/PairingSubsystem PairingSubsystem
 * @parent app.models.capabilities
 *
 * Utility for walking a user through the pairing process.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function ListPairingDevices
     *
     * Gets all the PairingDevices from the pairingDevices attribute.
     *
     * @return {Promise}
     */
    ListPairingDevices() {
      return Bridge.request('subpairing:ListPairingDevices', this.GetDestination(), {});
    },
    /**
     * @function StartPairing
     *
     * Attempts to pair the requested type of device. If the requested product is a hub connected device then the hub will enter pairing mode with the appropriate radios listening. If the requested product is not a hub connected device then the hub will not be put in pairing mode.
     *
     * @param {string} [productAddress] (default: &#x27;&#x27;) If specified this indicates the type of device being paired.  This will be used to determine the pairing steps that should be returned as well as the radios to turn on for the hub.
     * @param {boolean} [mock] (default: false) If set to true the system will attempt to create a mock device for pairing purposes, this is not supported by all product addresses and is intended for debugging.  When set to true the hub will never be put in pairing mode.
     * @return {Promise}
     */
    StartPairing(productAddress, mock) {
      return Bridge.request('subpairing:StartPairing', this.GetDestination(), {
        productAddress,
        mock,
      });
    },
    /**
     * @function Search
     *
     * Attempts to pair the requested device.
This will also start / reset the IdlePairing timer.
If the requested product is a hub connected device then the hub will enter pairing mode with the appropriate radios listening.
If the requested product is a cloud connected device then the system will enter pairing mode for the given device.
If the requested product is an OAuth connected device, an error will be returned. If no productId is specified this will turn all hub radios into pairing mode and search for all types of devices.
     *
     * @param {string} [productAddress] (default: &#x27;&#x27;) The address of the product catalog entry for the device being paired.
     * @param {map<string>} [form] (default: {}) Any input parameters gathered from the user.
     * @return {Promise}
     */
    Search(productAddress, form) {
      return Bridge.request('subpairing:Search', this.GetDestination(), {
        productAddress,
        form,
      });
    },
    /**
     * @function ListHelpSteps
     *
     * Retrieves the help steps for the product currently being search for, or steps specific to the active pairing protocols.
     *
     * @return {Promise}
     */
    ListHelpSteps() {
      return Bridge.request('subpairing:ListHelpSteps', this.GetDestination(), {});
    },
    /**
     * @function DismissAll
     *
     * Dismisses all devices from pairingDevices that are in the PAIRED state.
This should be invoked when cancelling / exiting pairing.
This will take the hub out of pairing mode.
This will take the hub out of unpairing mode.
     *
     * @return {Promise}
     */
    DismissAll() {
      return Bridge.request('subpairing:DismissAll', this.GetDestination(), {});
    },
    /**
     * @function StopSearching
     *
     * This clears all timeouts, takes the place/hub out of pairing or unpairing mode, and takes the state back to IDLE.
     *
     * @return {Promise}
     */
    StopSearching() {
      return Bridge.request('subpairing:StopSearching', this.GetDestination(), {});
    },
    /**
     * @function FactoryReset
     *
     * Retrieves the factory reset steps for the product currently being search for, or steps specific to the active pairing protocols.
This will take the hub out of pairing mode.
     *
     * @return {Promise}
     */
    FactoryReset() {
      return Bridge.request('subpairing:FactoryReset', this.GetDestination(), {});
    },
    /**
     * @function GetKitInformation
     *
     * Gets the information about a kit.  This is a pair of product id, and the protocoladdress of that device.  Protocol address can be used to determine the state of the kitted device.
     *
     * @return {Promise}
     */
    GetKitInformation() {
      return Bridge.request('subpairing:GetKitInformation', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onPairingIdleTimeout
     *
     * Indicates that it is taking longer to pair the device than it should be.  This is done in order to provide remediation steps to any listeners.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPairingIdleTimeout(callback) {
      Cornea.on('subpairing subpairing:PairingIdleTimeout', callback);
    },
    /**
     * @function onPairingTimeout
     *
     * Emitted when the system stops searching due to a timeout rather than an explicit user action, like Customize or DismissAll.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPairingTimeout(callback) {
      Cornea.on('subpairing subpairing:PairingTimeout', callback);
    },
    /**
     * @function onPairingFailed
     *
     * Emitted when the pairing failed during search.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPairingFailed(callback) {
      Cornea.on('subpairing subpairing:PairingFailed', callback);
    },
  },
  PAIRINGMODE_IDLE: 'IDLE',
  PAIRINGMODE_HUB: 'HUB',
  PAIRINGMODE_CLOUD: 'CLOUD',
  PAIRINGMODE_OAUTH: 'OAUTH',
  PAIRINGMODE_HUB_UNPAIRING: 'HUB_UNPAIRING',
};
