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
import Device from 'i2web/models/device';
import SceneDevice from 'i2web/models/sceneDevice';
import 'i2web/components/spinner/';
import 'i2web/components/thermostat/';
import view from './device-configurator.stache';
import _startCase from 'lodash/startCase';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {canMap} selector
     * @parent i2web/components/scenes/device-configurator
     *
     * Selector object to be applied to the sceneDevice
     */
    selector: {
      Value: canMap,
    },
    /**
     * @property {sceneDevice} sceneDevice
     * @parent i2web/components/scenes/device-configurator
     *
     * sceneDevice whose values we are setting
     */
    sceneDevice: {
      Type: SceneDevice,
    },
    /**
     * @property {Number} thermostatMinSetPoint
     * @parent i2web/components/scenes/device-configurator
     *
     * minimum setpoint for thermostats
     */
    thermostatMinSetPoint: {
      value() {
        return (this.attr('sceneDevice') && this.attr('sceneDevice.thermostatMinSetPoint')) || Device.THERMOSTAT_MIN_TEMPERATURE;
      },
    },
    /**
     * @property {Number} thermostatMaxSetPoint
     * @parent i2web/components/scenes/device-configurator
     *
     * maximum setpoint for thermostats
     */
    thermostatMaxSetPoint: {
      value() {
        return (this.attr('sceneDevice') && this.attr('sceneDevice.thermostatMaxSetPoint')) || Device.THERMOSTAT_MAX_TEMPERATURE;
      },
    },
     /**
     * @property {boolean} autoSupported
     * @parent i2web/components/scenes/device-configurator
     *
     * Whether or not the AUTO mode is supported for a thermostat
     */
    autoSupported: {
      type: 'boolean',
      get() {
        const sceneDevice = this.attr('sceneDevice');
        return sceneDevice && sceneDevice.attr('device.web:therm:autoSupported');
      },
    },
  },
  /**
   * @function durationFormatter
   * @property {String} val
   * @return {String}
   * @parent i2web/components/scenes/device-configurator
   *
   * Formats the duration value
   */
  durationFormatter(val) {
    let unitText = '';
    const unit = this.attr('selector.unit');
    if (unit) {
      unitText = `<sup>${_startCase(unit)}</sup>`;
    }
    return `${val} ${unitText}`;
  },
  /**
   * @function temperatureFormatter
   * @property {String} val
   * @return {String}
   * @parent i2web/components/scenes/device-configurator
   *
   * Formats the temperature value
   */
  temperatureFormatter(val) {
    return val && `${val.toFixed(0)}<span class="value-unit">&deg;</span>`;
  },
  /**
   * @function percentageChanged
   * @property {Object} event
   * @property {String} selectorName
   * @parent i2web/components/scenes/device-configurator
   *
   * Sets the new percentage value at selectorName
   */
  percentageChanged(event, selectorName) {
    this.attr('sceneDevice.values').attr(selectorName, +event.target.value);
  },
  /**
   * @function booleanToggle
   * @property {String} selectorName
   * @parent i2web/components/scenes/device-configurator
   *
   * Toggles the boolean value at selectorName
   */
  booleanToggle(selectorName) {
    this.attr('sceneDevice.values').attr(selectorName, !this.attr('sceneDevice.values').attr(selectorName));
  },
  /**
   * @function toggleSwitchOnOff
   * @parent i2web/components/scenes/device-configurator
   *
   * Toggles the a binary property ON or OFF
   */
  toggleSwitchOnOff() {
    const On = this.attr('selector.value.0.0');
    const Off = this.attr('selector.value.1.0');
    const selector = this.attr('selector.name');
    const currentValue = this.attr('sceneDevice.values').attr(selector);
    const newValue = (currentValue === On) ? Off : On;
    this.attr('sceneDevice').toggleGroupValues(this.attr('selector'), newValue);
    this.attr('sceneDevice.values').attr(selector, newValue);
  },
});

export default Component.extend({
  tag: 'arcus-scenes-device-configurator',
  viewModel: ViewModel,
  view,
  helpers: {
    'switch-description': function switchDescription(value, device) {
      if (value && device) {
        if (device.attr('web:scene:groupString')) {
          return _startCase(`${device.attr('web:scene:groupString').replace('{{action}}', value)}`.toLowerCase());
        }
        return _startCase(`${value} ${device.attr('dev:devtypehint')}`.toLowerCase());
      }
      return 'Loading...';
    },
    'percentage-description': function percentageDescription(selectorName) {
      if (selectorName) {
        switch (selectorName.toLowerCase()) {
          case 'ventlevel':
            return 'level';
          case 'dim':
            return 'brightness';
          default:
            return selectorName.toLowerCase();
        }
      }
      return 'Loading...';
    },
    'percentage-min': function percentageMin(selectorName) {
      if (selectorName) {
        switch (selectorName.toLowerCase()) {
          case 'ventlevel':
          case 'dim':
            return 10;
          default:
            return 0;
        }
      }
      return 'Loading...';
    },
    'percentage-step': function percentageStep(selectorName) {
      if (selectorName) {
        switch (selectorName.toLowerCase()) {
          case 'ventlevel':
          case 'dim':
            return 10;
          default:
            return 1;
        }
      }
      return 'Loading...';
    },
    capitalize(value = '') {
      return _startCase(value.toLowerCase());
    },
  },
});
