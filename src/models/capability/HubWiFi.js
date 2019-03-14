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
 * @module {Object} i2web/models/HubWiFi HubWiFi
 * @parent app.models.capabilities
 *
 * Model of Hub WiFi information.
 */
export default {
  writeableAttributes: [
    /**
     * @property {boolean} hubwifi\:wifiEnabled
     *
     * When true, wireless interface is enabled.
     *
     */
    'hubwifi:wifiEnabled',
  ],
  methods: {
    /**
     * @function WiFiConnect
     *
     * Attempts to connect to the access point with the given properties.
     *
     * @param {string} ssid SSID of base station connected to.
     * @param {string} [bssid] BSSID of base station connected to.
     * @param {string} security Security of connection.
     * @param {string} [key] Security key.
     * @return {Promise}
     */
    WiFiConnect(ssid, bssid, security, key) {
      return Bridge.request('hubwifi:WiFiConnect', this.GetDestination(), {
        ssid,
        bssid,
        security,
        key,
      });
    },
    /**
     * @function WiFiDisconnect
     *
     * Disconnects from current access point. USE WITH CAUTION.
     *
     * @return {Promise}
     */
    WiFiDisconnect() {
      return Bridge.request('hubwifi:WiFiDisconnect', this.GetDestination(), {});
    },
    /**
     * @function WiFiStartScan
     *
     * Starts a wifi scan that will end after timeout seconds unless endWifiScan() is called. Periodically, while WiFi scan is active, WiFiScanResults events will be generated.
     *
     * @param {int} timeout The number of seconds to scan unless endWifiScan() is called.
     * @return {Promise}
     */
    WiFiStartScan(timeout) {
      return Bridge.request('hubwifi:WiFiStartScan', this.GetDestination(), {
        timeout,
      });
    },
    /**
     * @function WiFiEndScan
     *
     * Ends any active WiFiScan. If no scan is active, this is a no-op.
     *
     * @return {Promise}
     */
    WiFiEndScan() {
      return Bridge.request('hubwifi:WiFiEndScan', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onWiFiScanResults
     *
     * Drivers should return a complete list of all BSSIDs found during the lifetime of the scan, not just those BSSIDs which are newly observed at the time of event generation.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onWiFiScanResults(callback) {
      Cornea.on('hubwifi hubwifi:WiFiScanResults', callback);
    },
    /**
     * @function onWiFiConnectResult
     *
     * This event will be returned once testing of the wireless connect attempt completes or times out.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onWiFiConnectResult(callback) {
      Cornea.on('hubwifi hubwifi:WiFiConnectResult', callback);
    },
  },
  WIFISTATE_CONNECTED: 'CONNECTED',
  WIFISTATE_DISCONNECTED: 'DISCONNECTED',
  WIFISECURITY_NONE: 'NONE',
  WIFISECURITY_WEP: 'WEP',
  WIFISECURITY_WPA_PSK: 'WPA_PSK',
  WIFISECURITY_WPA2_PSK: 'WPA2_PSK',
  WIFISECURITY_WPA_ENTERPRISE: 'WPA_ENTERPRISE',
  WIFISECURITY_WPA2_ENTERPRISE: 'WPA2_ENTERPRISE',
};
