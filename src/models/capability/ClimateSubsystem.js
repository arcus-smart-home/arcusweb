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
 * @module {Object} i2web/models/ClimateSubsystem ClimateSubsystem
 * @parent app.models.capabilities
 *
 * Climate Subsystem
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} subclimate\:primaryTemperatureDevice
     *
     * The temperature sensor that should be used when displaying the temperature for the whole place.  This may be null if no devices support temperature.
     *
     */
    'subclimate:primaryTemperatureDevice',
    /**
     * @property {string} subclimate\:primaryHumidityDevice
     *
     * The humidity sensor that should be used when displaying the humidity for the whole place.  This may be null if no devices support humidity.
     *
     */
    'subclimate:primaryHumidityDevice',
    /**
     * @property {string} subclimate\:primaryThermostat
     *
     * The primary thermostat for the house, this may be null if there are no thermostat devices.
     *
     */
    'subclimate:primaryThermostat',
  ],
  methods: {
    /**
     * @function EnableScheduler
     *
     * Enables the scheduler associated with the given thermostat.  NOTE this will return a &#x27;timezone.notset&#x27; error if the place does not have a valid timezone.
     *
     * @param {String} thermostat The address of the thermostat to enable the schedule for
     * @return {Promise}
     */
    EnableScheduler(thermostat) {
      return Bridge.request('subclimate:EnableScheduler', this.GetDestination(), {
        thermostat,
      });
    },
    /**
     * @function DisableScheduler
     *
     * Enables the scheduler associated with the given thermostat.
     *
     * @param {String} thermostat The address of the thermostat to disable the schedule for
     * @return {Promise}
     */
    DisableScheduler(thermostat) {
      return Bridge.request('subclimate:DisableScheduler', this.GetDestination(), {
        thermostat,
      });
    },
  },
  events: {},

};
