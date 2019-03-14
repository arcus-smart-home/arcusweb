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
 * @module {Object} i2web/models/PairingDevice PairingDevice
 * @parent app.models.capabilities
 *
 * A reference to a device that is in the process of being paired.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function Customize
     *
     * Retrieves the customization steps for the given device, the deviceId should match the value from discoveredDeviceIds or PairingDevice#deviceId.
If this call is successful the hub will no longer be in any pairing mode.
     *
     * @return {Promise}
     */
    Customize() {
      return Bridge.request('pairdev:Customize', this.GetDestination(), {});
    },
    /**
     * @function AddCustomization
     *
     * Used by the client to indicate which customizations they have applied to the device.  The set may be read from the customizations attribute.
     *
     * @param {string} customization The customization applied by the user.
     * @return {Promise}
     */
    AddCustomization(customization) {
      return Bridge.request('pairdev:AddCustomization', this.GetDestination(), {
        customization,
      });
    },
    /**
     * @function Dismiss
     *
     * Dismisses a device from the pairing subsystem.  This should be called when customization is completed or skipped.
This call is idempotent, so if the device has previously been dismissed this will not return an error, unlike Customize.
     *
     * @return {Promise}
     */
    Dismiss() {
      return Bridge.request('pairdev:Dismiss', this.GetDestination(), {});
    },
    /**
     * @function Remove
     *
     * Attempts to remove the given device.
This call will return immediately to give the user removal steps, but the caller should watch for
a base:Deleted event to be emitted from the PairingDevice.
This call is safe to retry, but if a notfound error is returned that indicates a previous call
already succeeded.
This will take the hub out of pairing mode and may put it in unpairing mode depending on the device
being removed.
     *
     * @return {Promise}
     */
    Remove() {
      return Bridge.request('pairdev:Remove', this.GetDestination(), {});
    },
    /**
     * @function ForceRemove
     *
     * Causes the hub to blacklist this device and treat it as if it was deleted even though it still has connectivity to the hub.
This will take the hub out of pairing mode.
     *
     * @return {Promise}
     */
    ForceRemove() {
      return Bridge.request('pairdev:ForceRemove', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onDiscovered
     *
     * Emitted when a new device is discovered, intended for analytics &amp; debugging.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDiscovered(callback) {
      Cornea.on('pairdev pairdev:Discovered', callback);
    },
    /**
     * @function onConfigured
     *
     * Emitted when a device successfully completes configuration, intended for analytics &amp; debugging.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onConfigured(callback) {
      Cornea.on('pairdev pairdev:Configured', callback);
    },
    /**
     * @function onPairingFailed
     *
     * Emitted when a device fails pairing, intended for analytics &amp; debugging.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPairingFailed(callback) {
      Cornea.on('pairdev pairdev:PairingFailed', callback);
    },
  },
  PAIRINGSTATE_PAIRING: 'PAIRING',
  PAIRINGSTATE_MISPAIRED: 'MISPAIRED',
  PAIRINGSTATE_MISCONFIGURED: 'MISCONFIGURED',
  PAIRINGSTATE_PAIRED: 'PAIRED',
  PAIRINGPHASE_JOIN: 'JOIN',
  PAIRINGPHASE_CONNECT: 'CONNECT',
  PAIRINGPHASE_IDENTIFY: 'IDENTIFY',
  PAIRINGPHASE_PREPARE: 'PREPARE',
  PAIRINGPHASE_CONFIGURE: 'CONFIGURE',
  PAIRINGPHASE_FAILED: 'FAILED',
  PAIRINGPHASE_PAIRED: 'PAIRED',
  REMOVEMODE_CLOUD: 'CLOUD',
  REMOVEMODE_HUB_AUTOMATIC: 'HUB_AUTOMATIC',
  REMOVEMODE_HUB_MANUAL: 'HUB_MANUAL',
};
