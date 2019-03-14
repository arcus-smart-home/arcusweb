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
 * @module {Object} i2web/models/WaterHeater WaterHeater
 * @parent app.models.capabilities
 *
 * Model of a water heater.
 */
export default {
  writeableAttributes: [
    /**
     * @property {double} waterheater\:setpoint
     *
     * This is the user-defined setpoint of desired hotwater. The setting cannot be above the (max) setpoint set on the hardware.
     *
     */
    'waterheater:setpoint',
  ],
  methods: {},
  events: {},
  HOTWATERLEVEL_LOW: 'LOW',
  HOTWATERLEVEL_MEDIUM: 'MEDIUM',
  HOTWATERLEVEL_HIGH: 'HIGH',
};
