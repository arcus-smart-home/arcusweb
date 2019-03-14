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

import _ from 'lodash';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import Device from 'i2web/models/device';
import SidePanel from 'i2web/plugins/side-panel';
import Subsystem from 'i2web/models/subsystem';
import view from './settings.stache';

import 'i2web/components/subsystem/climate/settings/selectDevice.component';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/climate/settings
     * @description The Climate subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {boolean} hasTemperatureDevices
     * @parent i2web/components/subsystem/climate/settings
     * @description Whether the place has any temperature-capable devices paired
     */
    hasTemperatureDevices: {
      get() {
        const temperatureDevices = this.attr('subsystem.subclimate:temperatureDevices');
        return temperatureDevices && temperatureDevices.attr('length');
      },
    },
    /**
     * @property {boolean} hasHumidityDevices
     * @parent i2web/components/subsystem/climate/settings
     * @description Whether the place has any humidity-capable devices paired
     */
    hasHumidityDevices: {
      get() {
        const humidityDevices = this.attr('subsystem.subclimate:humidityDevices');
        return humidityDevices && humidityDevices.attr('length');
      },
    },
    /**
     * @property {boolean} hasNoRelevantDevices
     * @parent i2web/components/subsystem/climate/settings
     * @description Whether the place lacks relevant devices for Climate system settings
     */
    hasNoRelevantDevices: {
      get() {
        return !(this.attr('hasTemperatureDevices') || this.attr('hasHumidityDevices'));
      },
    },
    /**
     * @property {Device} humidityDevice
     * @parent i2web/components/subsystem/climate/settings
     * @description The device on which dashboard humidity is based
     */
    humidityDevice: {
      Type: Device,
      get() {
        const humidityDeviceId = this.attr('subsystem.subclimate:primaryHumidityDevice');
        if (humidityDeviceId) {
          const humidityDevices = this.attr('subsystem.web:subclimate:humidityDevices');
          return _.find(humidityDevices, d => d['base:address'] === humidityDeviceId);
        }
        return undefined;
      },
    },
    /**
     * @property {Device} temperatureDevice
     * @parent i2web/components/subsystem/climate/settings
     * @description The device on which dashboard temperature is based
     */
    temperatureDevice: {
      Type: Device,
      get() {
        const temperatureDeviceId = this.attr('subsystem.subclimate:primaryTemperatureDevice');
        if (temperatureDeviceId) {
          const temperatureDevices = this.attr('subsystem.web:subclimate:temperatureDevices');
          return _.find(temperatureDevices, d => d['base:address'] === temperatureDeviceId);
        }
        return undefined;
      },
    },
  },
  /**
   * @function selectDevice
   * @parent i2web/components/subsystem/climate/settings
   * @description Open the side panel so that User can select an appropriate device for dashboard reporting
   */
  selectDevice(deviceType) {
    SidePanel.right(`<arcus-subsystem-climate-settings-select-device {(device-type)}="deviceType" {(subsystem)}="subsystem" />`, {
      deviceType,
      subsystem: this.attr('subsystem'),
    });
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-climate-settings',
  viewModel: ViewModel,
  view,
});
