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
 * @module {Object} i2web/models/Thermostat Thermostat
 * @parent app.models.capabilities
 *
 * Model of a thermostat.
 */
export default {
  writeableAttributes: [
    /**
     * @property {double} therm\:coolsetpoint
     *
     * The desired low temperature when the HVAC unit is in cooling or auto mode. May also be used to set the target temperature.
     *
     */
    'therm:coolsetpoint',
    /**
     * @property {double} therm\:heatsetpoint
     *
     * The desired high temperature when the HVAC unit is in heating or auto mode. May also be used to set the target temperature.
     *
     */
    'therm:heatsetpoint',
    /**
     * @property {enum} therm\:hvacmode
     *
     * The current mode of the HVAC system.
     *
     */
    'therm:hvacmode',
    /**
     * @property {int} therm\:fanmode
     *
     * Current fan mode setting.
     *
     */
    'therm:fanmode',
    /**
     * @property {enum} therm\:emergencyheat
     *
     * Useful only for 2 stage heat pumps that require a secondary (usually electric) heater when the external temperature is below a certain threshold.
     *
     */
    'therm:emergencyheat',
    /**
     * @property {enum} therm\:controlmode
     *
     * The current mode of the HVAC system.
     *
     */
    'therm:controlmode',
    /**
     * @property {string} therm\:filtertype
     *
     * Placeholder for user to enter filter type like 16x25x1.
     *
     */
    'therm:filtertype',
    /**
     * @property {int} therm\:filterlifespanruntime
     *
     * Placeholder for user to enter life span (in runtime hours) of the filter.
     *
     */
    'therm:filterlifespanruntime',
    /**
     * @property {int} therm\:filterlifespandays
     *
     * Placeholder for user to enter life span (in total days) of the filter.
     *
     */
    'therm:filterlifespandays',
  ],
  methods: {
    /**
     * @function changeFilter
     *
     * Indicates that the filter has been changed and that runtimesincefilterchange and dayssincefilterchange should be reset.
     *
     * @return {Promise}
     */
    changeFilter() {
      return Bridge.request('therm:changeFilter', this.GetDestination(), {});
    },
    /**
     * @function SetIdealTemperature
     *
     * Updates the heat and/or cool set point depending on the current mode.  When in heat mode this will adjust only the heat set point, when in cool mode it will adjust only the cool set point.  When in auto mode, it will set each 2 degrees F from the desired temp.  If the OFF no action should be taken.
     *
     * @param {double} temperature The target temperature to set.
     * @return {Promise}
     */
    SetIdealTemperature(temperature) {
      return Bridge.request('therm:SetIdealTemperature', this.GetDestination(), {
        temperature,
      });
    },
    /**
     * @function IncrementIdealTemperature
     *
     * Updates the heat and/or cool set point depending on the current mode.  When in heat mode this will adjust only the heat set point, when in cool mode it will adjust only the cool set point.  When in auto mode, it will attempt to determine the current ideal temp then adjust cool and heat points.
     *
     * @param {double} amount The amount to increment the temperature
     * @return {Promise}
     */
    IncrementIdealTemperature(amount) {
      return Bridge.request('therm:IncrementIdealTemperature', this.GetDestination(), {
        amount,
      });
    },
    /**
     * @function DecrementIdealTemperature
     *
     * Updates the heat and/or cool set point depending on the current mode.  When in heat mode this will adjust only the heat set point, when in cool mode it will adjust only the cool set point.  When in auto mode, it will attempt to determine the current ideal temp then adjust cool and heat points.
     *
     * @param {double} amount The amount to decrement the temperature
     * @return {Promise}
     */
    DecrementIdealTemperature(amount) {
      return Bridge.request('therm:DecrementIdealTemperature', this.GetDestination(), {
        amount,
      });
    },
  },
  events: {
    /**
     * @function onSetPointChanged
     *
     * Notifies the system that a thermostat setpoint has been changed.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onSetPointChanged(callback) {
      Cornea.on('therm therm:SetPointChanged', callback);
    },
  },
  HVACMODE_OFF: 'OFF',
  HVACMODE_AUTO: 'AUTO',
  HVACMODE_COOL: 'COOL',
  HVACMODE_HEAT: 'HEAT',
  HVACMODE_ECO: 'ECO',
  // TODO: Add these 2 properties below to the capability file in arcusplatform
  FANMODE_AUTO: 0,
  FANMODE_ON: 1,
  EMERGENCYHEAT_ON: 'ON',
  EMERGENCYHEAT_OFF: 'OFF',
  CONTROLMODE_PRESENCE: 'PRESENCE',
  CONTROLMODE_MANUAL: 'MANUAL',
  CONTROLMODE_SCHEDULESIMPLE: 'SCHEDULESIMPLE',
  CONTROLMODE_SCHEDULEADVANCED: 'SCHEDULEADVANCED',
  ACTIVE_RUNNING: 'RUNNING',
  ACTIVE_NOTRUNNING: 'NOTRUNNING',
};
