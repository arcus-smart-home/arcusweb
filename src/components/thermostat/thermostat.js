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

import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import 'can-stache-converters';
import 'i2web/components/spinner/';
import uniqueId from 'i2web/plugins/unique-id';
import view from './thermostat.stache';
import temperatureConverter from 'i2web/plugins/temperature-converter';
import ThermostatCapability from 'i2web/models/capability/Thermostat';
import Device from 'i2web/models/device';

const VALID_MODES = [
  ThermostatCapability.HVACMODE_OFF,
  ThermostatCapability.HVACMODE_ECO,
  ThermostatCapability.HVACMODE_AUTO,
  ThermostatCapability.HVACMODE_COOL,
  ThermostatCapability.HVACMODE_HEAT];
const STD_HEAT_TEMPERATURE_F = 68;
const STD_COOL_TEMPERATURE_F = 78;

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Device} device
     * @parent i2web/components/thermostat
     *
     * Thermostat Device
     */
    device: {
      Type: Device,
    },
    /**
     * @property {String} uniqueId
     * @parent i2web/components/thermostat
     *
     * a unique id for the thermostat instance
     */
    uniqueId: {
      type: 'string',
      value() {
        return uniqueId();
      },
    },
    /**
     * @property {Boolean} scheduleEnabled
     * @parent i2web/components/thermostat
     *
     * Whether thermostat schedule is enabled or not
     */
    scheduleEnabled: {
      type: 'boolean',
    },
    /**
     * @property {String} fanmode
     * @parent i2web/components/thermostat
     * 
     * FanMode - one of AUTO (0), or ON (1)
     */
    fanmode: {
      type: 'number'
    },
    /**
     * @property {String} mode
     * @parent i2web/components/thermostat
     *
     * HVACMode - one of OFF, AUTO, COOL, or HEAT
     */
    mode: {
      set(value) {
        if (value) {
          if (VALID_MODES.indexOf(value) === -1 || value === ThermostatCapability.HVACMODE_OFF) {
            return ThermostatCapability.HVACMODE_OFF;
          }
          if (value !== ThermostatCapability.HVACMODE_COOL && !this.attr('heatSetpoint')) {
            this.attr('heatSetpoint', STD_HEAT_TEMPERATURE_F);
          }
          if (value !== ThermostatCapability.HVACMODE_HEAT && !this.attr('coolSetpoint')) {
            this.attr('coolSetpoint', STD_COOL_TEMPERATURE_F);
          }
          if (value === ThermostatCapability.HVACMODE_AUTO) {
            let initialDifference = this.attr('coolSetpoint') - this.attr('heatSetpoint');
            if (initialDifference < this.attr('setPointSeparation')) {
              this.attr('coolSetpoint', STD_COOL_TEMPERATURE_F);
              this.attr('heatSetpoint', STD_HEAT_TEMPERATURE_F);
              initialDifference = this.attr('coolSetpoint') - this.attr('heatSetpoint');
            }
            if (initialDifference === this.attr('setPointSeparation')) {
              this.attr('maxHeatSetpoint', this.attr('heatSetpoint'));
            } else {
              this.attr('maxHeatSetpoint', this.attr('heatSetpoint') + Math.floor((initialDifference - this.attr('setPointSeparation')) / 2));
            }
            this.attr('minCoolSetpoint', this.attr('maxHeatSetpoint') + this.attr('setPointSeparation'));
          }
        }
        return value;
      },
    },
    /**
     * @property {boolean} autoSupported
     * @parent i2web/components/thermostat
     *
     * Whether or not the AUTO mode is supported for the thermostat
     */
    autoSupported: {
      type: 'boolean',
    },
    /**
     * @property {Number} heatSetpoint
     * @parent i2web/components/thermostat
     *
     * Current heat set point
     */
    heatSetpoint: {
      type: 'number',
      set(value) {
        if (this.attr('mode') === ThermostatCapability.HVACMODE_AUTO) {
          this.attr('minCoolSetpoint', value + this.attr('setPointSeparation'));
        }
        return value;
      },
    },
    /**
     * @property {Number} coolSetpoint
     * @parent i2web/components/thermostat
     *
     * Current cooling set point
     */
    coolSetpoint: {
      type: 'number',
      set(value) {
        if (this.attr('mode') === ThermostatCapability.HVACMODE_AUTO) {
          this.attr('maxHeatSetpoint', value - this.attr('setPointSeparation'));
        }
        return value;
      },
    },
    /**
     * @property {Number} minSetpoint
     * @parent i2web/components/thermostat
     *
     * Minimum set point
     */
    minSetpoint: {
      get() {
        const device = this.attr('device');
        if (device && device.attr('therm:minsetpoint')) {
          return temperatureConverter(device.attr('therm:minsetpoint'), 'F');
        }
        return Device.THERMOSTAT_MIN_TEMPERATURE;
      },
    },
    /**
     * @property {Number} maxSetpoint
     * @parent i2web/components/thermostat
     *
     * Maximum set point
     */
    maxSetpoint: {
      get() {
        const device = this.attr('device');
        if (device && device.attr('therm:maxsetpoint')) {
          return temperatureConverter(device.attr('therm:maxsetpoint'), 'F');
        }
        return Device.THERMOSTAT_MAX_TEMPERATURE;
      },
    },
    /**
     * @property {Number} setPointSeparation
     * @parent i2web/components/thermostat
     *
     * Minimum separation required between cool and heat set points
     */
    setPointSeparation: {
      get() {
        const device = this.attr('device');
        if (device) {
          const setpointseparation = device.attr('therm:setpointseparation');
          if (setpointseparation) {
            return temperatureConverter(setpointseparation, 'F') - 32;
          }
        }
        return Device.THERMOSTAT_MIN_SEPARATION;
      },
    },
    /**
     * @property {Number} minCoolSetpoint
     * @parent i2web/components/thermostat
     *
     * Minimum set point allowed for Cool spinner
     */
    minCoolSetpoint: {
      type: 'number',
    },
    /**
     * @property {Number} maxHeatSetpoint
     * @parent i2web/components/thermostat
     *
     * Maximum set point allowed for Heat spinner
     */
    maxHeatSetpoint: {
      type: 'number',
    },
  },
  ThermostatCapability,
  /**
   * @function formatter
   * @parent i2web/components/thermostat
   * @param {Number} val
   * @return {String}
   *
   * Formats the temperature value
   */
  formatter(val) {
    return val && `${val.toFixed(0)}<span class="value-unit">&deg;</span>`;
  },
  /**
   * @function toggleSwitchOnOff
   * @parent i2web/components/thermostat
   *
   * Toggles the Follow Schedule switch on and off
   */
  toggleSwitchOnOff() {
    this.attr('scheduleEnabled', !this.attr('scheduleEnabled'));
    if (!this.attr('scheduleEnabled') && !this.attr('mode')) {
      this.attr('mode', ThermostatCapability.HVACMODE_OFF);
    }
  },
});

export default Component.extend({
  tag: 'arcus-thermostat',
  viewModel: ViewModel,
  view,
});
