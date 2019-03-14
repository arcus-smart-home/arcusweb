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

import Cornea from 'i2web/cornea/';

/**
 * @module {Object} i2web/models/HubPower HubPower
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {},
  events: {
    /**
     * @function onHubPowerSourceChanged
     *
     * Event to indicate the power source changed.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onHubPowerSourceChanged(callback) {
      Cornea.on('hubpow hubpow:HubPowerSourceChanged', callback);
    },
    /**
     * @function onHubBatteryLow
     *
     * Event to indicate that the battery level is low.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onHubBatteryLow(callback) {
      Cornea.on('hubpow hubpow:HubBatteryLow', callback);
    },
  },
  SOURCE_MAINS: 'MAINS',
  SOURCE_BATTERY: 'BATTERY',
};
