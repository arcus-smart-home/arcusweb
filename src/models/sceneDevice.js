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
 * @module {canMap} i2web/models/sceneDevice Scene Device
 * @parent app.models
 */
import canList from 'can-list';
import canMap from 'can-map';
import canBatch from 'can-event/batch/batch';
import 'can-map-define';
import Device from 'i2web/models/device';
import Subsystem from 'i2web/models/subsystem';
import AppState from 'i2web/plugins/get-app-state';
import _find from 'lodash/find';
import isEmptyObject from 'can-util/js/is-empty-object/';
import canDev from 'can-util/js/dev/';
import temperatureConverter from 'i2web/plugins/temperature-converter';
import Errors from 'i2web/plugins/errors';
import ThermostatCapability from 'i2web/models/capability/Thermostat';


const SceneDevice = canMap.extend({
  define: {
    /**
     * @property {Device} device
     * @parent i2web/models/sceneDevice
     *
     * The device being manipulated by this scene
     */
    device: {
      type: '*',
    },
    /**
     * @property {string} deviceAddress
     * @parent i2web/models/sceneDevice
     *
     * The device address in the scene. Used to load the device.
     */
    deviceAddress: {
      set(address) {
        const type = (address.includes('SERV:')) ? Subsystem : Device;
        type.get({
          'base:address': address,
        }).then(device => this.attr('device', device))
          .catch(e => Errors.log(e, true));
        return address;
      },
    },
    /**
     * @property {canMap} values
     * @parent i2web/models/sceneDevice
     *
     * The list of values that will be set for this device when the scene is run
     */
    values: {
      Value: canMap,
    },
    /**
     * @property {canList} selectors
     * @parent i2web/models/sceneDevice
     *
     * Selectors available for this device
     */
    selectors: {
      Type: canList,
    },
    /**
     * @property {Boolean} hasValues
     * @parent i2web/models/sceneDevice
     *
     * Whether the device has any values
     */
    hasValues: {
      type: 'boolean',
      get() {
        return !!(canMap.keys(this.attr('values')).length);
      },
    },
    /**
     * @property {String} valueDescription
     * @parent i2web/models/sceneDevice
     *
     * Human readable description that explains what values are set
     */
    valueDescription: {
      get() {
        if (this.attr('hasValues')) {
          const descriptors = [];
          this._getValueDescriptionRecursive(this.attr('selectors'), descriptors);
          return descriptors.map((descriptor) => {
            // uppercase the first character
            return descriptor.charAt(0).toUpperCase() + descriptor.slice(1);
          }).join('<br />');
        }
        return '';
      },
    },
    /**
     * @property {Number} thermostatMinSetPoint
     * @parent i2web/components/models/sceneDevice
     *
     * minimum setpoint for thermostats
     */
    thermostatMinSetPoint: {
      get() {
        const device = this.attr('device');
        if (device && device.attr('therm:minsetpoint')) {
          return temperatureConverter(device.attr('therm:minsetpoint'), 'F');
        }
        return Device.THERMOSTAT_MIN_TEMPERATURE;
      },
    },
    /**
     * @property {Number} thermostatMaxSetPoint
     * @parent i2web/components/models/sceneDevice
     *
     * maximum setpoint for thermostats
     */
    thermostatMaxSetPoint: {
      get() {
        const device = this.attr('device');
        if (device.attr('therm:maxsetpoint')) {
          return temperatureConverter(device.attr('therm:maxsetpoint'), 'F');
        }
        return Device.THERMOSTAT_MAX_TEMPERATURE;
      },
    },
    /**
     * @property {Subsystem} _climateSubsystem
     * @parent i2web/components/models/sceneDevice
     *
     * climate subsystem for the place
     */
    _climateSubsystem: {
      Type: Subsystem,
      get() {
        const subsystems = AppState().attr('subsystems');
        if (subsystems) {
          return _find(subsystems, (subsystem) => {
            return subsystem.attr('id') === 'subclimate';
          });
        }
        return null;
      },
    },
  },
  /**
   * @function toggleDefaults
   * @parent i2web/models/sceneDevice
   *
   * Sets or unsets default values for the device (runs when a device is enabled or disabled)
   */
  toggleDefaults() {
    if (this.attr('hasValues')) {
      this.attr('values', {});
    } else {
      // batch this, as the action-device-selector listens for change events on the values
      // we only want one event to fire for the full set of defaults
      canBatch.start();
      this._setDefaultValueRecursive(this.attr('selectors'));
      canBatch.stop();
    }
  },
  /**
   * @function toggleGroupValues
   * @param {canMap} selector
   * @param {*} newly selected value
   * @parent i2web/models/sceneDevice
   *
   * Sets or unsets default values for a group selector (runs when changing group values)
   */
  toggleGroupValues(selector, selectedValue) {
    const currentValue = this.attr('values').attr(selector.name);
    if (currentValue === selectedValue) return;

    canBatch.start();
    selector.attr('value').forEach((selectorValue) => {
      if (selectorValue[1].length) {
        if (selectorValue[0] === selectedValue) {
          this._setDefaultValueRecursive(selectorValue[1]);
        } else {
          this._removeValuesRecursive(selectorValue[1]);
        }
      }
    });
    canBatch.stop();
  },
  /**
   * @function _getValueDescriptionRecursive
   * @param {canList} selectors
   * @param {canList} descriptors
   * @parent i2web/models/sceneDevice
   *
   * Gets the human readable description that explains what values are set
   */
  _getValueDescriptionRecursive(selectors, descriptors) {
    selectors.forEach((selector) => {
      const value = this.attr('values').attr(selector.name);
      if (value !== undefined) {
        // first, check for any name-specific overrides
        switch (selector.name) {
          case 'dim':
            descriptors.push(`${value}% Brightness`);
            break;
          case 'duration':
            {
              const unit = selector.unit || 'SEC';
              const unitDescription = unit.charAt(0).toUpperCase() + unit.toLowerCase().slice(1);
              descriptors.push(`Record for ${value} ${unitDescription}`);
            }
            break;
          case 'ventlevel':
            descriptors.push(`${value}% Open`);
            break;
          default:
            // otherwise, we should get the value based on type/level of nesting
            switch (selector.type) {
              case 'GROUP':
                {
                  // if the group has sub-options, show nothing and only describe its sub-values
                  const group = _find(selector.value, (selectorValue) => {
                    return selectorValue[0] === value;
                  });
                  if (group && group[1].length) {
                    this._getValueDescriptionRecursive(group[1], descriptors);
                  } else {
                    descriptors.push(`${value.toLowerCase()}`);
                  }
                }
                break;
              case 'LIST':
                // Get the label value and display that
                {
                  const group = _find(selector.value, (selectorValue) => {
                    return selectorValue[1] === value;
                  });
                  if (group && group[0]) {
                    descriptors.push(`${group[0].toLowerCase()}`);
                  } else {
                    descriptors.push(`${value.toLowerCase()}`);
                  }
                }
                break;
              case 'THERMOSTAT':
                if (value.attr('scheduleEnabled')) {
                  descriptors.push(`Follow Schedule`);
                } else if (!value.attr('mode') || value.attr('mode') === ThermostatCapability.HVACMODE_OFF) {
                  descriptors.push('Off');
                } else {
                  const temps = [];
                  const modeDescription = value.attr('mode') === ThermostatCapability.HVACMODE_AUTO ? this.attr('device.web:therm:autoDescription') :
                    value.attr('mode').charAt(0).toUpperCase() + value.attr('mode').toLowerCase().slice(1);
                  if (value.attr('mode') !== ThermostatCapability.HVACMODE_COOL
                    && value.attr('heatSetPoint')) {
                    temps.push(`${temperatureConverter(value.attr('heatSetPoint'), 'F')}<span class="value-unit">&deg;</span>`);
                  }
                  if (value.attr('mode') !== ThermostatCapability.HVACMODE_HEAT
                    && value.attr('coolSetPoint')) {
                    temps.push(`${temperatureConverter(value.attr('coolSetPoint'), 'F')}<span class="value-unit">&deg;</span>`);
                  }
                  descriptors.push(`${modeDescription} Mode (${temps.join(' to ')})`);
                }
                break;
              case 'TEMPERATURE':
                descriptors.push(`${temperatureConverter(value, 'F')}<span class="value-unit">&deg;</span>`);
                break;
              case 'DURATION':
                descriptors.push(`${value} ${(selector.unit || 'Sec')}`);
                break;
              case 'PERCENT':
                descriptors.push(`${value}%`);
                break;
              case 'RANGE':
                descriptors.push(`${value}`);
                break;
              case 'BOOLEAN':
                descriptors.push(`${selector.name}: ${(value ? 'Yes' : 'No')}`);
                break;
              default:
                descriptors.push(`${(`${value}`).toLowerCase()}`);
                break;
            }
            break;
        }
      }
    });
  },
  /**
   * @function setDefaultValueRecrusive
   * @param {canList} selectors
   * @parent i2web/models/sceneDevice
   *
   * Sets or unsets default values for the device
   */
  _setDefaultValueRecursive(selectors) {
    selectors.forEach((selector) => {
      let newValue = null;

      switch (selector.name) {
        case 'alarm-state':
          newValue = this._getValueOrDefault(selector, this.attr('device').attr('subsecurity:alarmMode'));
          break;
        case 'dim':
          newValue = this._getValueOrDefault(selector, this.attr('device').attr('dim:brightness'));
          break;
        case 'doorState':
          {
            let value = null;
            const deviceState = this.attr('device').attr('motdoor:doorstate');
            if (['CLOSED', 'CLOSING', 'CLOSE'].indexOf(deviceState) !== -1) {
              value = 'CLOSE';
            } else if (['OBSTRUCTION', 'OPEN', 'OPENING'].indexOf(deviceState) !== -1) {
              value = 'OPEN';
            }
            newValue = this._getValueOrDefault(selector, value);
          }
          break;
        case 'duration':
          newValue = this._getDefaultValueFromType(selector);
          break;
        case 'fan':
          newValue = this._getValueOrDefault(selector, this.attr('device').attr('swit:state'));
          break;
        case 'fanspeed':
          newValue = this._getValueOrDefault(selector, this.attr('device').attr('fan:speed'));
          break;
        case 'heatstate':
          newValue = this._getValueOrDefault(selector, this.attr('device').attr('spaceheater:heatstate'));
          break;
        case 'lockstate':
          newValue = this._getValueOrDefault(selector, this.attr('device').attr('doorlock:lockstate'));
          break;
        case 'setpoint':
          newValue = this._getValueOrDefault(selector, this.attr('device').attr('spaceheater:setpoint'));
          break;
        case 'shadeopen':
          {
            let deviceState = this.attr('device').attr('shade:open');
            if (this.attr('device').hasCapability('somfyv1')) {
              deviceState = this.attr('device').attr('somfyv1:currentstate');
            }
            newValue = this._getValueOrDefault(selector, deviceState);
          }
          break;
        case 'switch':
          newValue = this._getValueOrDefault(selector, this.attr('device').attr('swit:state'));
          break;
        case 'thermostat':
          {
            const deviceState = {};
            if (this.attr('_climateSubsystem')) {
              const deviceSchedule = this.attr('_climateSubsystem').attr('subclimate:thermostatSchedules').attr(this.attr('deviceAddress'));
              const scheduleEnabled = (deviceSchedule && deviceSchedule.attr('enabled')) || false;
              deviceState.scheduleEnabled = scheduleEnabled;

              if (!scheduleEnabled) {
                const mode = this.attr('device').attr('therm:hvacmode') || ThermostatCapability.HVACMODE_OFF;
                const coolSetPoint = this.attr('device').attr('therm:coolsetpoint');
                const heatSetPoint = this.attr('device').attr('therm:heatsetpoint');
                if (mode === ThermostatCapability.HVACMODE_AUTO) {
                  Object.assign(deviceState, {
                    coolSetPoint,
                    heatSetPoint,
                  });
                } else if (mode === ThermostatCapability.HVACMODE_COOL) {
                  deviceState.coolSetPoint = coolSetPoint;
                } else if (mode === ThermostatCapability.HVACMODE_HEAT) {
                  deviceState.heatSetPoint = heatSetPoint;
                }
                deviceState.mode = mode;
              }
            }
            newValue = this._getValueOrDefault(selector, deviceState);
          }
          break;
        case 'valvestate':
          newValue = this._getValueOrDefault(selector, this.attr('device').attr('valv:valvestate'));
          break;
        case 'vent':
          {
            const deviceState = (this.attr('device').attr('vent:level') > 10) ? 'OPEN' : 'CLOSE';
            newValue = this._getValueOrDefault(selector, deviceState);
          }
          break;
        case 'ventlevel':
          newValue = this._getValueOrDefault(selector, this.attr('device').attr('vent:level'));
          break;
        default:
          newValue = this._getDefaultValueFromType(selector);
          break;
      }
      this.attr(`values.${selector.name}`, newValue);
    });
  },
  /**
   * @function _getValueOrDefault
   * @param {canMap} selector
   * @param {*} value
   * @parent i2web/models/sceneDevice
   *
   * Gets either the passed in value or the default value for the selector
   */
  _getValueOrDefault(selector, value) {
    if (this._isValidSelectorValue(selector, value)) {
      if (selector.type === 'GROUP') {
        this._setDefaultValueRecursive(selector.value[0][1]);
      }
      // if the vent is 'OPEN' it will never have a 'ventlevel' lower than 10
      if (selector.name === 'ventlevel' && value < 10) {
        return 10;
      }
      return value;
    }
    canDev.warn('selector', selector, 'given an invalid value', value);
    return this._getDefaultValueFromType(selector);
  },
  /**
   * @function _getDefaultValueFromType
   * @param {canMap} selector
   * @parent i2web/models/sceneDevice
   *
   * Gets default values for the selector
   */
  _getDefaultValueFromType(selector) {
    switch (selector.type) {
      case 'BOOLEAN':
        return false;
      case 'LIST':
        return selector.value[0][1];
      case 'GROUP':
        this._setDefaultValueRecursive(selector.value[0][1]);
        return selector.value[0][0];
      case 'THERMOSTAT':
        return {
          scheduleEnabled: false,
          mode: ThermostatCapability.HVACMODE_OFF,
        };
      case 'TEMPERATURE':
        return (selector.min ? selector.min : this.attr('thermostatMinSetPoint'));
      case 'RANGE':
      case 'PERCENT':
      case 'DURATION':
      default:
        return (selector.min ? selector.min : 0);
    }
  },
  /**
   * @function _isValidSelectorValue
   * @param {canMap} selector
   * @param {*} value
   * @parent i2web/models/sceneDevice
   *
   * Validates selector values
   */
  _isValidSelectorValue(selector, value) {
    switch (selector.type) {
      case 'BOOLEAN':
        return (typeof value === 'boolean');
      case 'LIST':
        for (let i = 0; i < selector.value.length; i++) {
          if (value === selector.value[i][1]) return true;
        }
        return false;
      case 'PERCENT':
        return (typeof value === 'number' && value >= 0 && value <= 100);
      case 'GROUP':
        for (let i = 0; i < selector.value.length; i++) {
          if (value === selector.value[i][0]) return true;
        }
        return false;
      case 'THERMOSTAT':
        // we build the thermostat object ourselves,
        // so we assume it's valid as long as it's not empty and the mode and setPoint(s) are valid
        if (isEmptyObject(value)) return false;
        if (value.hasOwnProperty('scheduleEnabled') && typeof value.scheduleEnabled !== 'boolean') return false;
        if (value.hasOwnProperty('mode')
          && [ThermostatCapability.HVACMODE_OFF, ThermostatCapability.HVACMODE_AUTO, ThermostatCapability.HVACMODE_COOL, ThermostatCapability.HVACMODE_HEAT].indexOf(value.mode) === -1) return false;
        if (value.hasOwnProperty('coolSetPoint') && (value.coolSetPoint < this.attr('thermostatMinSetPoint') || value.coolSetPoint > this.attr('thermostatMaxSetPoint'))) return false;
        if (value.hasOwnProperty('heatSetPoint') && (value.heatSetPoint < this.attr('thermostatMinSetPoint') || value.heatSetPoint > this.attr('thermostatMaxSetPoint'))) return false;
        return true;
      case 'TEMPERATURE':
      case 'RANGE':
      case 'DURATION':
        return (typeof value === 'number' && value >= (selector.min || 0) && value <= (selector.max || Infinity));
      default:
        return false;
    }
  },
  /**
   * @function _removeValuesRecursive
   * @param {canList} selectors
   * @parent i2web/models/sceneDevice
   *
   * Removes unselected default values recursively
   */
  _removeValuesRecursive(selectors) {
    selectors.forEach((selector) => {
      const currentValue = this.attr('values').attr(selector.name);
      if (currentValue !== undefined) {
        this.attr('values').removeAttr(selector.name);
        if (selector.type === 'GROUP') {
          selector.attr('value').forEach((selectorValue) => {
            if (selectorValue[0] === currentValue) {
              this._removeValuesRecursive(selectorValue[1]);
            }
          });
        }
      }
    });
  },
});

/**
 * @constructor {canList} i2web/models/sceneDevice.static.List List
 * @parent i2web/models/sceneDevice.static
 */
SceneDevice.List = canList.extend({
  Map: SceneDevice,
}, {});

export default SceneDevice;
