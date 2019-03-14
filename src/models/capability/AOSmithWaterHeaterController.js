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

/**
 * @module {Object} i2web/models/AOSmithWaterHeaterController AOSmithWaterHeaterController
 * @parent app.models.capabilities
 *
 * Model of an AO Smith water heater controller.
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} aosmithwaterheatercontroller\:updaterate
     *
     * The rate in seconds of how often the water heater polls the platform.
     *
     */
    'aosmithwaterheatercontroller:updaterate',
    /**
     * @property {enum} aosmithwaterheatercontroller\:units
     *
     * The display unit of the temperation.
     *
     */
    'aosmithwaterheatercontroller:units',
    /**
     * @property {enum} aosmithwaterheatercontroller\:controlmode
     *
     * This is the mode setting of the device, not whether or not it is actually heating the water at the moment.
     *
     */
    'aosmithwaterheatercontroller:controlmode',
    /**
     * @property {enum} aosmithwaterheatercontroller\:leakdetect
     *
     * Enable or disable leak detection. Or report that no sensor is present and force to disabled.
     *
     */
    'aosmithwaterheatercontroller:leakdetect',
    /**
     * @property {string} aosmithwaterheatercontroller\:modelnumber
     *
     * Model number as recorded on the heater&#x27;s label
     *
     */
    'aosmithwaterheatercontroller:modelnumber',
    /**
     * @property {string} aosmithwaterheatercontroller\:serialnumber
     *
     * Serial number as recorded on the heater&#x27;s label
     *
     */
    'aosmithwaterheatercontroller:serialnumber',
  ],
  methods: {},
  events: {},
  UNITS_C: 'C',
  UNITS_F: 'F',
  CONTROLMODE_STANDARD: 'STANDARD',
  CONTROLMODE_VACATION: 'VACATION',
  CONTROLMODE_ENERGY_SMART: 'ENERGY_SMART',
  LEAKDETECT_DISABLED: 'DISABLED',
  LEAKDETECT_ENABLED: 'ENABLED',
  LEAKDETECT_NOTDETECTED: 'NOTDETECTED',
  LEAK_NONE: 'NONE',
  LEAK_DETECTED: 'DETECTED',
  LEAK_UNPLUGGED: 'UNPLUGGED',
  LEAK_ERROR: 'ERROR',
  ELEMENTFAIL_NONE: 'NONE',
  ELEMENTFAIL_UPPER: 'UPPER',
  ELEMENTFAIL_LOWER: 'LOWER',
  ELEMENTFAIL_UPPER_LOWER: 'UPPER_LOWER',
  TANKSENSORFAIL_NONE: 'NONE',
  TANKSENSORFAIL_UPPER: 'UPPER',
  TANKSENSORFAIL_LOWER: 'LOWER',
  TANKSENSORFAIL_UPPER_LOWER: 'UPPER_LOWER',
  MASTERDISPFAIL_NONE: 'NONE',
  MASTERDISPFAIL_MASTER: 'MASTER',
  MASTERDISPFAIL_DISPLAY: 'DISPLAY',
};
