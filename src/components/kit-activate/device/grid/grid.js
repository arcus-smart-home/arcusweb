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
import CanMap from 'can-map';
import 'can-map-define';
import PairingDevice from 'i2web/models/pairing-device';
import Subsystem from 'i2web/models/subsystem';
import AppState from 'i2web/plugins/get-app-state';
import view from './grid.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Device.List} devices
     * @parent i2web/components/kit-activate/device/grid
     * @description The devices of this particular place
     */
    devices: {
      get() {
        const devices = AppState().attr('devices');
        // To observe changes for devices added and removed
        devices.attr('length');
        return devices;
      },
    },
    /**
     * @property {String} hubImageURL
     * @parent i2web/components/kit-activate/device/grid
     * @description The hub image, unactivated if the Hub is missing
     */
    hubImageURL: {
      get() {
        const baseURL = AppState().attr('session.secureStaticResourceBaseUrl');
        const activated = this.attr('hub') ? 'activated' : 'unactivated';
        return `${baseURL}/o/dtypes/hub/${activated}_small-ios-3x.png`;
      },
    },
    /**
     * @property {String} hubName
     * @parent i2web/components/kit-activate/device/grid
     * @description The hub name, or 'Hub Missing' if the Hub doesn't exist
     */
    hubName: {
      get() {
        return (this.attr('hub')) ? this.attr('hub.hub:name') : 'Hub Missing';
      },
    },
    /**
     * @property {CanMap} hubIsSearching
     * @parent i2web/components/kit-activate/device/grid
     * @description If the hub should animate that it is searching
     */
    hubIsSearching: {
      get() {
        return this.attr('hub') && !this.attr('isKitComplete');
      },
    },
    /**
     * @property {Boolean} isKitComplete
     * @parent i2web/components/kit-activate/device/grid
     * @description All kit devices are fully activated and customized; and there are no errors or mispairs
     */
    isKitComplete: {
      type: 'boolean',
    },
    /**
     * @property {CanMap} kitDevices
     * @parent i2web/components/kit-activate/device/grid
     * @description Kitting information from the Subsystem
     */
    kitDevices: {
      Type: CanMap,
    },
    /**
     * @property {PairingDevice} pairingDevice
     * @parent i2web/components/kit-activate/device/grid
     * @description The pairing device to be customized
     */
    pairingDevice: {
      Type: PairingDevice,
    },
    /**
     * @property {PairingDevice.List} pairingDevices
     * @parent i2web/components/kit-activate/device/grid
     * @description The list of kitted pairing devices from the subsystem
     */
    pairingDevices: {
      Type: PairingDevice.List,
    },
    /**
     * @property {CanList} products
     * @parent i2web/components/kit-activate/device/grid
     * @description The product catalog
     */
    products: {
      get() {
        return AppState().attr('products');
      },
    },
    /**
     * @property {Boolean} ready
     * @parent i2web/components/kit-activate/device/grid
     * @description Set to true when the async calls for KitInfo and Pairing Devs have completed
     */
    ready: {
      get() {
        return this.attr('kitDevices') && this.attr('pairingDevices');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/kit-activate/device/grid
     * @description The Pairing subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  /**
   * @function customizePairingDevice
   * @parent i2web/components/kit-activate/device/grid
   * @description Set the pairing device to customize
   */
  customizePairingDevice(device) {
    this.attr('pairingDevice', device);
  },
  /**
   * @function {Device} getDeviceFor
   * @parent i2web/components/kit-activate/device/grid
   * @description Retrieve the device (if it exists) for a particular Kit Device
   */
  getDeviceFor(kitDevice) {
    if (!this.attr('devices')) return undefined;

    const found = this.attr('devices').filter((d) => {
      return kitDevice.protocolAddress.includes(d.attr('devadv:protocolid'));
    });
    return found[0];
  },
  /**
   * @function {Device} getPairingDeviceFor
   * @parent i2web/components/kit-activate/device/grid
   * @description Retrieve the pairing device (if it exists) for a particular Kit Device
   */
  getPairingDeviceFor(kitDevice) {
    if (!this.attr('pairingDevices')) return undefined;

    const found = this.attr('pairingDevices').filter((d) => {
      return d.attr('pairdev:protocolAddress') === kitDevice.protocolAddress;
    });
    return found[0];
  },
  /**
   * @function {Product} getProductFor
   * @parent i2web/components/kit-activate/device/grid
   * @description Retrieve the product for a particular Kit Device
   */
  getProductFor(kitDevice) {
    return this.attr(`products.${kitDevice.productId}`);
  },
});

export default Component.extend({
  tag: 'arcus-kit-activate-device-grid',
  viewModel: ViewModel,
  view,
});
