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
 * @module {Object} i2web/models/WiFi WiFi
 * @parent app.models.capabilities
 *
 * Model of WiFi information.
 */
export default {
  writeableAttributes: [
    /**
     * @property {boolean} wifi\:enabled
     *
     * When true, wireless interface is enabled.
     *
     */
    'wifi:enabled',
  ],
  methods: {
    /**
     * @function Connect
     *
     * Attempts to connect to the access point with the given properties.
     *
     * @param {string} ssid SSID of base station connected to.
     * @param {string} [bssid] BSSID of base station connected to.
     * @param {string} security Security of connection.
     * @param {string} [key] Security key.
     * @return {Promise}
     */
    Connect(ssid, bssid, security, key) {
      return Bridge.request('wifi:Connect', this.GetDestination(), {
        ssid,
        bssid,
        security,
        key,
      });
    },
    /**
     * @function Disconnect
     *
     * Disconnects from current access point. USE WITH CAUTION.
     *
     * @return {Promise}
     */
    Disconnect() {
      return Bridge.request('wifi:Disconnect', this.GetDestination(), {});
    },
  },
  events: {},
  STATE_CONNECTED: 'CONNECTED',
  STATE_DISCONNECTED: 'DISCONNECTED',
  SECURITY_NONE: 'NONE',
  SECURITY_WEP: 'WEP',
  SECURITY_WPA_PSK: 'WPA_PSK',
  SECURITY_WPA2_PSK: 'WPA2_PSK',
  SECURITY_WPA_ENTERPRISE: 'WPA_ENTERPRISE',
  SECURITY_WPA2_ENTERPRISE: 'WPA2_ENTERPRISE',
};
