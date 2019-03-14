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
 * @module {Object} i2web/models/WaterSubsystem WaterSubsystem
 * @parent app.models.capabilities
 *
 * Water Subsystem
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} subwater\:primaryWaterHeater
     *
     * When the first water heater is added it will be populated with that value.  This will be null if no water heater devices exist in the system.
     *
     */
    'subwater:primaryWaterHeater',
    /**
     * @property {string} subwater\:primaryWaterSoftener
     *
     * When the first water softener is added it will be populated with that value. This will be null if no water softener devices exist in the system.
     *
     */
    'subwater:primaryWaterSoftener',
  ],
  methods: {},
  events: {
    /**
     * @function onContinuousWaterUse
     *
     * Emitted when a new water flow sensor detects continuous use. The device address will also be added to continuousWaterUseDevices.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onContinuousWaterUse(callback) {
      Cornea.on('subwater subwater:ContinuousWaterUse', callback);
    },
    /**
     * @function onExcessiveWaterUse
     *
     * Emitted when a new water flow sensor detects excessive use. The device address will also be added to excessiveWaterUseDevices.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onExcessiveWaterUse(callback) {
      Cornea.on('subwater subwater:ExcessiveWaterUse', callback);
    },
    /**
     * @function onLowSalt
     *
     * Emitted when a new water softener is added to the set of low salt devices.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onLowSalt(callback) {
      Cornea.on('subwater subwater:LowSalt', callback);
    },
  },

};
