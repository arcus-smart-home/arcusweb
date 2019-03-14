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
import Subsystem from 'i2web/models/subsystem';
import DeviceConnection from 'i2web/models/capability/DeviceConnection';
import WaterSoftener from 'i2web/models/capability/WaterSoftener';
import CanMap from 'can-map';
import 'can-map-define';
import view from './card.stache';
import find from 'lodash/find';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/climate/card
     * Water subsystem model
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {Integer} deviceCount
     * @parent i2web/components/subsystem/climate/card
     * Number of devices attached to this subsystem
     */
    deviceCount: {
      get() {
        return this.attr('subsystem.subwater:waterDevices.length');
      },
    },
    /**
     * @property {Device} shutOffDevice
     * @parent i2web/components/subsystem/climate/card
     * The primary water shut off device
     */
    shutOffDevice: {
      get() {
        const closedWaterValveId = this.attr('subsystem.subwater:closedWaterValves.0');
        const waterValves = this.attr('subsystem.allDevices').filter(d => d.attr('web:dev:devtypehint') === 'watervalve');

        if (closedWaterValveId) {
          return find(waterValves, d => d.attr('base:address') === closedWaterValveId);
        }

        return waterValves[0] || null;
      },
    },
    /**
     * @property {Device} softenerDevice
     * @parent i2web/components/subsystem/climate/card
     * The primary water softener device
     */
    softenerDevice: {
      get() {
        const primarySoftenerId = this.attr('subsystem.subwater:primaryWaterSoftener');
        return primarySoftenerId
          ? find(this.attr('subsystem.allDevices'), d => d.attr('base:address') === primarySoftenerId)
          : null;
      },
    },
    /**
     * @property {Device} heaterDevice
     * @parent i2web/components/subsystem/climate/card
     * The primary water heater device
     */
    heaterDevice: {
      get() {
        const primaryHeaterId = this.attr('subsystem.subwater:primaryWaterHeater');
        return primaryHeaterId
          ? find(this.attr('subsystem.allDevices'), d => d.attr('base:address') === primaryHeaterId)
          : null;
      },
    },
    /**
     * @property {Device} panelsToShow
     * @parent i2web/components/subsystem/climate/card
     * Array of panel ids that should be displayed as part of this card
     */
    panelsToShow: {
      get() {
        const shutOffDevice = this.attr('shutOffDevice');
        const softenerDevice = this.attr('softenerDevice');
        const heaterDevice = this.attr('heaterDevice');

        // if there is a shut off device show it with softener if existing, heater if existing, or softener if neither exists
        if (shutOffDevice) {
          if (softenerDevice || !heaterDevice) {
            return ['shut-off', 'softener'];
          }
          if (heaterDevice) {
            return ['shut-off', 'heater'];
          }
        }

        // if there is a heater and softener device
        if (heaterDevice && softenerDevice) {
          return ['heater', 'softener'];
        }

        // if there is just a heater device
        if (heaterDevice) {
          return ['shut-off', 'heater'];
        }

        // if there is just a softener device
        if (softenerDevice) {
          return ['shut-off', 'softener'];
        }

        // return no panels only if all devices missing
        return [];
      },
    },
    /**
     * @property {boolean} showShutOff
     * @parent i2web/components/subsystem/climate/card
     * If the card should show the shut off panel
     */
    showShutOff: {
      get() {
        return this.attr('panelsToShow').includes('shut-off');
      },
    },
    /**
     * @property {boolean} showSoftener
     * @parent i2web/components/subsystem/climate/card
     * If the card should show the softener panel
     */
    showSoftener: {
      get() {
        return this.attr('panelsToShow').includes('softener');
      },
    },
    /**
     * @property {boolean} showHeater
     * @parent i2web/components/subsystem/climate/card
     * If the card should show the heater panel
     */
    showHeater: {
      get() {
        return this.attr('panelsToShow').includes('heater');
      },
    },
    /**
     * @property {boolean} showShutOffDetail
     * @parent i2web/components/subsystem/climate/card
     * If the shut off device detail should be shown
     */
    showShutOffDetail: {
      get() {
        const shutOffDevice = this.attr('shutOffDevice');
        return shutOffDevice && !this.hasErrors(shutOffDevice);
      },
    },
    /**
     * @property {boolean} shutOffDeviceClosed
     * @parent i2web/components/subsystem/climate/card
     * If the shut off device is currently closed
     */
    shutOffDeviceClosed: {
      get() {
        const shutOffDeviceId = this.attr('shutOffDevice.base:address');
        return this.attr('subsystem.subwater:closedWaterValves').indexOf(shutOffDeviceId) > -1;
      },
    },
  },
  /**
   * @property {Function<boolean>} hasErrors
   * @parent i2web/components/subsystem/climate/card
   * Return if a water device model is in an error state
   */
  // TODO: move this to per-capability device model mixins when possible
  hasErrors(device) {
    return !!device && device.attr('erroredState') !== undefined;
  },
  /**
   * @property {Function<String>} errorText
   * @parent i2web/components/subsystem/climate/card
   * Return water device model error text appropriate for the error state if any
   */
  // TODO: move this to per-capability device model mixins when possible
  errorText(device) {
    const errorState = device.attr('erroredState');
    let text = null;

    if (errorState) {
      text = errorState.short;

      // adjust standard offline status error message into one specified by specs for this card
      if (text === 'No Connection') { text = 'Offline'; }
    }

    return text;
  },
  WaterSoftenerCapability: WaterSoftener,
  DeviceConnectionCapability: DeviceConnection,
});

export default Component.extend({
  tag: 'arcus-subsystem-water-card',
  viewModel: ViewModel,
  view,
});
