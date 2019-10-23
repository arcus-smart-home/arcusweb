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
 * @module {Object} i2web/models/Device Device
 * @parent app.models.capabilities
 *
 * Base device capabilities shared by all devices.
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} dev\:name
     *
     * Human readable name for the device
     *
     */
    'dev:name',
  ],
  methods: {
    /**
     * @function ListHistoryEntries
     *
     * Returns a list of all the history log entries associated with this device
     *
     * @param {int} [limit] The maximum number of events to return (defaults to 10)
     * @param {string} [token] The token from a previous query to use for retrieving the next set of results
     * @return {Promise}
     */
    ListHistoryEntries(limit, token) {
      return Bridge.request('dev:ListHistoryEntries', this.GetDestination(), {
        limit,
        token,
      });
    },
    /**
     * @function Remove
     *
     * Attempts to remove the given device.
This call will return immediately to give the user removal steps, but the caller should watch for
a base:Deleted event to be emitted from the Device.
This call is safe to retry, but if a notfound error is returned that indicates a previous call
already succeeded.
This may put the hub in unpairing mode depending on the device being removed.
     *
     * @param {long} [timeout] The number of milliseconds that device removal is expected for.  Defaults to 5 minutes if not specified.
     * @return {Promise}
     */
    Remove(timeout) {
      return Bridge.request('dev:Remove', this.GetDestination(), {
        timeout,
      });
    },
    /**
     * @function ForceRemove
     *
     * Sent to request that a device be removed.
     *
     * @return {Promise}
     */
    ForceRemove() {
      return Bridge.request('dev:ForceRemove', this.GetDestination(), {});
    },

    /**
     * @function Identify
     *
     * Sent to request that a device be identified.
     *
     * @return {Promise}
     */
    Identify() {
      return Bridge.request('ident:Identify', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onDeviceConnected
     *
     * Sent when a device comes online. This may be very specific to the given protocol and require client interpretation.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeviceConnected(callback) {
      Cornea.on('dev dev:DeviceConnected', callback);
    },
    /**
     * @function onDeviceDisconnected
     *
     * Sent when a device goes offline. This may be very specific to the given protocol and require client interpretation.  Not all drivers will be able to detect this event.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeviceDisconnected(callback) {
      Cornea.on('dev dev:DeviceDisconnected', callback);
    },
    /**
     * @function onDeviceRemoved
     *
     * Sent when a device is removed.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeviceRemoved(callback) {
      Cornea.on('dev dev:DeviceRemoved', callback);
    },
  },

};
