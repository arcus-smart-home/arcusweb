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
import Cornea from 'i2web/cornea/';
import CanMap from 'can-map';
import CanList from 'can-list';
import 'can-map-define';
import canRoute from 'can-route';
import PairingDevice from 'i2web/models/pairing-device';
import PairingSubsystemCaps from 'i2web/models/capability/PairingSubsystem';
import ProductCapability from 'i2web/models/capability/Product';
import Subsystem from 'i2web/models/subsystem';
import view from './device.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {String} cloudSearchError
     * @parent i2web/components/pairing/connect/device
     * @description Transitions to a string if an error response is emitted after searching for a cloud device
     */
    cloudSearchError: {
      type: 'string',
    },
    /**
     * @property {Object} formValues
     * @parent i2web/components/pairing/connect/device
     * @description A collection of strings retrieved from the pairing steps process.
     * These are values collected from the `form` property of the pairing steps.
     */
    formValues: {
      type: '*',
    },
    /**
     * @property {Boolean} helpRequired
     * @parent i2web/components/pairing/connect/device
     * @description Pairing.Search has failed to find a device, show the User help
     * steps
     */
    helpRequired: {
      value: false,
      get() {
        const noPairingDevices = this.attr('pairingDevices.length') === 0;
        const product = this.attr('product');
        const searchIsIdle = this.attr('subsystem.subpairing:searchIdle');
        return product && noPairingDevices && searchIsIdle;
      },
    },
    /**
     * @property {Boolean} isFinishedRegistration
     * @parent i2web/components/pairing/connect/device
     * @description Is the User finished with device registration process
     */
    isFinishedRegistration: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} isSearchInitializing
     * @parent i2web/components/pairing/connect/device
     * @description True when the application is starting up a Search, but is still waiting for the platform to
     * respond that the hub is in pairing mode.
     */
    isSearchInitializing: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {PairingDevice} pairingDevice
     * @parent i2web/components/pairing/connect/device
     * @description The device selected for customization
     */
    pairingDevice: {
      Type: PairingDevice,
    },
    /**
     * @property {CanList<PairingDevice>} pairingDevices
     * @parent i2web/components/pairing/connect/device
     * @description The "cart" of pairing device instances present in the the subsystem.
     */
    pairingDevices: {
      Type: CanList,
    },
    /**
     * @property {Boolean} pairingTimedOut
     * @parent i2web/components/pairing/connect/devices
     * @description The search for pairing devices has timed out and none have been
     * found.
     */
    pairingTimedOut: {
      value: false,
      get() {
        const mode = this.attr('subsystem.subpairing:pairingMode');
        const searchInitializing = this.attr('isSearchInitializing');
        return !searchInitializing
          && mode === PairingSubsystemCaps.PAIRINGMODE_IDLE
          && this.attr('subsystem.subpairing:searchTimeout') === 0
          && this.attr('pairingDevices.length') === 0;
      },
    },
    /**
     * @property {Object} product
     * @parent i2web/components/pairing/connect/device
     * @description Specific product from the product catalog. Used when pairing devices.
     */
    product: {
      Type: CanMap,
    },
    /**
     * @property {String} searchState
     * @parent i2web/components/pairing/connect/device
     * @description The state of the template while searching
     */
    searchState: {
      get() {
        if (this.attr('cloudSearchError')) { return 'cloud-error'; }
        if (this.attr('pairingTimedOut')) { return 'timed-out'; }
        return 'searching';
      },
    },
    /**
     * @property {Boolean} showSearching
     * @parent i2web/components/pairing/connect/device
     * @description Whether or not to show the animated searching icon
     */
    showSearching: {
      value: true,
      get() {
        const mode = this.attr('subsystem.subpairing:pairingMode');
        const idle = this.attr('subsystem.subpairing:searchIdle');
        return (mode === PairingSubsystemCaps.PAIRINGMODE_HUB
          || mode === PairingSubsystemCaps.PAIRINGMODE_CLOUD)
          && !idle;
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/pairing/connect/device
     * @description The Pairing subsystem used to search for the pairing device
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {String} title
     * @parent i2web/components/pairing/connect/device
     * @description The title to display on the pairing page
     */
    title: {
      get() {
        const mode = this.attr('subsystem.subpairing:pairingMode');
        const idle = this.attr('subsystem.subpairing:searchIdle');
        const found = this.attr('pairingDevices.length');
        if (mode === PairingSubsystemCaps.PAIRINGMODE_IDLE && !idle && found) {
          return `${found} Device${(found === 0 || found > 1) ? 's' : ''} Found!`;
        }
        if (this.attr('cloudSearchError')) {
          return 'Attention';
        }
        if (this.attr('pairingTimedOut')) {
          return 'Pairing Has Timed Out';
        }
        return 'Searching...';
      },
    },
  },
  /**
   * @function handleSearchErrors
   * @param {Object} error
   * @parent i2web/components/pairing/connect/device
   * @description When the pairing subsystem errors, handle the error appropriately
   */
  handleSearchErrors(error) {
    const errorCode = error ? error.code : '';
    if (errorCode === 'hub.missing' || errorCode === 'hub.offline') {
      this.attr('showUnavailableHub', true);
    } else if (this.isIpcd()) {
      this.attr('cloudSearchError',
        'We don\'t recognize that code. Confirm the code entered is correct.');
    }
  },
  /**
   * @function isIpcd
   * @parent i2web/components/pairing/connect/device
   * @description Determine if the product being paired is IPCD
   */
  isIpcd() {
    const mode = this.attr('subsystem.subpairing:pairingMode');
    const productPairingMode = this.attr('product.product:pairingMode');
    return mode === PairingSubsystemCaps.PAIRINGMODE_CLOUD ||
      productPairingMode === ProductCapability.PAIRINGMODE_IPCD;
  },
  /**
   * @function pairAnotherDevice
   * @parent i2web/components/pairing/connect/device
   * @description Change the route allowing the User to pair another device
   */
  pairAnotherDevice() {
    canRoute.attr({ page: 'product-catalog', subpage: 'brands', action: null });
  },
  /**
   * @function onPairingFailed
   * @parent i2web/components/pairing/connect/device
   * @param failure object provided by platform in PairingFailed event
   * @description Event handler that updates the display properly for a PairingFailed event
   */
  onPairingFailed(failure) {
    this.attr('cloudSearchError',
      (failure && failure.description) ? failure.description : 'Confirm the code entered is correct.');
  },
  /**
   * @function startSearching
   * @parent i2web/components/pairing/connect/device
   * @description Request that the pairing start searching for devices. Search
   * for particular devices if a product address is given. Search for all devices
   * if the address is undefined
   */
  startSearching() {
    const subsystem = this.attr('subsystem');
    if (subsystem) {
      const product = this.attr('product.base:address');
      this.attr('isSearchInitializing', true);
      this.removeAttr('cloudSearchError');
      subsystem.Search(product, this.attr('formValues'))
        .then(() => this.attr('isSearchInitializing', false))
        .catch((e) => {
          this.attr('isSearchInitializing', false);
          this.handleSearchErrors(e);
        });
    }
  },
  /**
   * @function stopSearching
   * @parent i2web/components/pairing/connect/device
   * @description Request that the pairing subsystem stop searching for any devices
   * to pair
   */
  stopSearching() {
    this.attr('subsystem').StopSearching();
    this.removeAttr('cloudSearchError');
    window.history.back();
  },
});

export default Component.extend({
  tag: 'arcus-pairing-connect-device',
  viewModel: ViewModel,
  view,
  events: {
    pairingFailedCallback: null,
    inserted() {
      this.pairingFailedCallback = this.viewModel.onPairingFailed.bind(this.viewModel);
      Cornea.on('sub subpairing:PairingFailed', this.pairingFailedCallback);

      this.viewModel.startSearching();
    },
    removed() {
      if (typeof this.pairingFailedCallback === 'function') {
        Cornea.removeListener('sub subpairing:PairingFailed',
          this.pairingFailedCallback);
      }
    },
    '{viewModel.subsystem} subpairing:searchTimeout': function searchTimeoutChange() {
      const vm = this.viewModel;
      const mode = vm.attr('subsystem.subpairing:pairingMode');
      const hubCloudMode = mode === PairingSubsystemCaps.PAIRINGMODE_HUB
        || mode === PairingSubsystemCaps.PAIRINGMODE_CLOUD;
      if (vm.attr('subsystem.subpairing:searchTimeout') > 0 && hubCloudMode) {
        vm.attr('isSearchInitializing', false);
      }
    },
  },
});
