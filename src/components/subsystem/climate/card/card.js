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
import view from './card.stache';
import Subsystem from 'i2web/models/subsystem';
import Device from 'i2web/models/device';
import _find from 'lodash/find';
import _isFinite from 'lodash/isFinite';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Device} primaryHumidityDevice
     * @parent i2web/components/subsystem/climate/card
     *
     * Finds the primary humidity device
     */
    primaryHumidityDevice: {
      Type: Device,
      get() {
        const humidityDevice = _find(this.attr('subsystem.allDevices'), (device) => {
          return device.attr('base:address') === this.attr('subsystem.subclimate:primaryHumidityDevice');
        });
        return humidityDevice;
      },
    },
    /**
     * @property {Boolean} primaryHumidityDeviceOnline
     * @parent i2web/components/subsystem/climate/card
     *
     * Checks if the humidity device is online or not
     */
    primaryHumidityDeviceOnline: {
      get() {
        const device = this.attr('primaryHumidityDevice');
        if (device) {
          return !device.attr('isOffline');
        }
        return false;
      },
    },
    /**
     * @property {String} primaryHumidityDeviceValue
     * @parent i2web/components/subsystem/climate/card
     *
     * Primary humiditys device value, which will be hidden if it is blank
     */
    primaryHumidityDeviceValue: {
      get() {
        const deviceOnline = this.attr('primaryHumidityDeviceOnline');
        const humidity = this.attr('primaryHumidityDevice.humid:humidity');

        return deviceOnline && _isFinite(humidity) ? Math.round(humidity) : '';
      },
    },
    /**
     * @property {Device} primaryTemperatureDevice
     * @parent i2web/components/subsystem/climate/card
     *
     * Finds the temperature device id from the subsystem
     */
    primaryTemperatureDevice: {
      Type: Device,
      get() {
        const temperatureDevice = _find(this.attr('subsystem.allDevices'), (device) => {
          return device.attr('base:address') === this.attr('subsystem.subclimate:primaryTemperatureDevice');
        });
        return temperatureDevice;
      },
    },
    /**
     * @property {Boolean} primaryTemperatureDeviceOnline
     * @parent i2web/components/subsystem/climate/card
     *
     * Checks if the temperature device is online or not
     */
    primaryTemperatureDeviceOnline: {
      get() {
        const device = this.attr('primaryTemperatureDevice');
        if (device) {
          return !device.attr('isOffline');
        }
        return false;
      },
    },
    /**
     * @property {String} primaryTemperatureDeviceValue
     * @parent i2web/components/subsystem/climate/card
     *
     * Primary temperature device value, which will be hidden if it is blank
     */
    primaryTemperatureDeviceValue: {
      get() {
        const deviceOnline = this.attr('primaryTemperatureDeviceOnline');
        const temperature = this.attr('primaryTemperatureDevice.temp:temperature');

        return deviceOnline && _isFinite(temperature) ? temperature : '';
      },
    },

    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/climate/card
     *
     * Climate subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {int} totalControlledDevices
     * @parent i2web/components/subsystem/climate/card
     *
     * Evaluates the total controlled devices available
     */
    totalControlledDevices: {
      get() {
        return this.attr('subsystem.subclimate:controlDevices.length');
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-card-climate',
  viewModel: ViewModel,
  view,
});
