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
 * @module {Object} i2web/models/WiFiScan WiFiScan
 * @parent app.models.capabilities
 *
 * Model of WiFi Scan information.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function StartWifiScan
     *
     * Starts a wifi scan that will end after timeout seconds unless endWifiScan() is called. Periodically, while WiFi scan is active, WiFiScanResults events will be generated.
     *
     * @param {int} timeout The number of seconds to scan unless endWifiScan() is called.
     * @return {Promise}
     */
    StartWifiScan(timeout) {
      return Bridge.request('wifiscan:StartWifiScan', this.GetDestination(), {
        timeout,
      });
    },
    /**
     * @function EndWifiScan
     *
     * Ends any active WiFiScan. If no scan is active, this is a no-op.
     *
     * @return {Promise}
     */
    EndWifiScan() {
      return Bridge.request('wifiscan:EndWifiScan', this.GetDestination(), {});
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
      Cornea.on('wifiscan wifiscan:WiFiScanResults', callback);
    },
  },

};
