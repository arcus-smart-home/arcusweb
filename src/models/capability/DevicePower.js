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
 * @module {Object} i2web/models/DevicePower DevicePower
 * @parent app.models.capabilities
 *
 * Model of a device&#x27;s power.
 */
export default {
  writeableAttributes: [],
  methods: {},
  events: {
    /**
     * @function onBackupBattery
     *
     * Fired when a line powered device loses power and is on backup battery.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onBackupBattery(callback) {
      Cornea.on('devpow devpow:BackupBattery', callback);
    },
    /**
     * @function onLinePowerRestored
     *
     * Fired when a device currently on backup battery has line power restored.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onLinePowerRestored(callback) {
      Cornea.on('devpow devpow:LinePowerRestored', callback);
    },
    /**
     * @function onBatteryLow
     *
     * Fired when a battery (backup or otherwise) is under 40%.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onBatteryLow(callback) {
      Cornea.on('devpow devpow:BatteryLow', callback);
    },
  },
  SOURCE_LINE: 'LINE',
  SOURCE_BATTERY: 'BATTERY',
  SOURCE_BACKUPBATTERY: 'BACKUPBATTERY',
};
