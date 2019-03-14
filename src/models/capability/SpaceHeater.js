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
 * @module {Object} i2web/models/SpaceHeater SpaceHeater
 * @parent app.models.capabilities
 *
 * Model of a space heater.
 */
export default {
  writeableAttributes: [
    /**
     * @property {double} spaceheater\:setpoint
     *
     * The desired temperature when the unit is running, maps to heatsetpoint in  thermostat. May also be used to set the target temperature.
     *
     */
    'spaceheater:setpoint',
    /**
     * @property {enum} spaceheater\:heatstate
     *
     * The current mode of the device, maps to OFF, HEAT in thermostat:mode.
     *
     */
    'spaceheater:heatstate',
  ],
  methods: {},
  events: {},
  HEATSTATE_OFF: 'OFF',
  HEATSTATE_ON: 'ON',
};
