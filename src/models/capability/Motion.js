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
 * @module {Object} i2web/models/Motion Motion
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} mot\:sensitivity
     *
     * The sensitivity of the motion sensor where:
OFF:   Implies that the motion sensor is disabled and will not detect motion
LOW:   Lowest possible detection sensitivity
MED:   Moderate detection sensitivity
HIGH:  High detection sensitivity
MAX:   Maximum sensitivity the device can be set to.
This will be null for motion sensors that do not support modification of sensitivity.
     *
     */
    'mot:sensitivity',
  ],
  methods: {},
  events: {},
  MOTION_NONE: 'NONE',
  MOTION_DETECTED: 'DETECTED',
  SENSITIVITY_OFF: 'OFF',
  SENSITIVITY_LOW: 'LOW',
  SENSITIVITY_MED: 'MED',
  SENSITIVITY_HIGH: 'HIGH',
  SENSITIVITY_MAX: 'MAX',
};
