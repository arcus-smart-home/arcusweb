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
import PairingDeviceCaps from 'i2web/models/capability/PairingDevice';
import CanMap from 'can-map';
import { deviceTypeConfig as deviceTypeConfigs, productConfig as productConfigs } from 'config/device';
import PairingDevice from 'i2web/models/pairing-device';
import Analytics from 'i2web/plugins/analytics';
import getAppState from 'i2web/plugins/get-app-state';
import 'can-map-define';
import toPairs from 'lodash/toPairs';
import fromPairs from 'lodash/fromPairs';
import find from 'lodash/find';
import view from './device-state.stache';

// short hand for the states represented in the PairingDevice capability
const PAIRINGSTATE = fromPairs(toPairs(PairingDeviceCaps)
  .filter(([k]) => k.startsWith('PAIRINGSTATE_'))
  .map(([k, v]) => [k.substr(13), v]));

const PAIRINGPHASE = fromPairs(toPairs(PairingDeviceCaps)
  .filter(([k]) => k.startsWith('PAIRINGPHASE_'))
  .map(([k, v]) => [k.substr(13), v]));

export const DeviceStateVM = CanMap.extend({
  define: {
    /**
     * @property {CanMap} pairingDevice
     * @parent i2web/components/pairing/device-state
     * @description the PairingDevice model rendered by this component
     */
    pairingDevice: { Type: PairingDevice },
    /**
     * @property {Promise} tryAgainPromise
     * @parent i2web/components/pairing/device-state
     * @description a Promise representing the status of a pairing retry attempt.
     * Promise managed by the onTryAgain handler function.
     */
    tryAgainPromise: { Type: Promise },
    /**
     * @property {Function} onTryAgain
     * @parent i2web/components/pairing/device-state
     * @description the function called when the 'Try Again' button is pressed. This handler should manage the
     *  tryAgainPromise property. Takes an instance of this view model as a single argument.
     */
    onTryAgain: { Type: Function },
    /**
     * @property {Function} onCustomize
     * @parent i2web/components/pairing/device-state
     * @description the function called when the 'Customize' button is pressed. Takes an instance of this view model
     * as a single argument.
     */
    onCustomize: { Type: Function },
    /**
     * @property {Function} onRemove
     * @parent i2web/components/pairing/device-state
     * @description the function called when the 'Remove' button is pressed. Takes an instance of this view model
     * as a single argument.
     */
    onRemove: { Type: Function },
    /**
     * @property {Device} device
     * @parent i2web/components/pairing/device-state
     * @description the device currently being paired. Derived from the state of the pairingDevice.
     *  Only available after the initial discovery phases of pairing are complete.
     */
    device: {
      get() {
        const deviceAddr = this.attr('pairingDevice.pairdev:deviceAddress');
        let device;

        if (deviceAddr) {
          device = find(getAppState().attr('devices'), dev => dev.attr('base:address') === deviceAddr);
        }

        return device;
      },
    },
    /**
     * @property {Product} product
     * @parent i2web/components/pairing/device-state
     * @description the product currently being paired. Derived from the state of the pairingDevice.
     *  Only available after the initial discovery phases of pairing are complete.
     */
    product: {
      get() {
        return this.attr('device.product');
      },
    },
    /**
     * @property {boolean} disableCustomize
     * @parent i2web/components/pairing/device-state
     * @description if the customize button should appear disabled.
     */
    disableCustomize: {
      get() {
        const state = this.attr('pairingDevice.pairdev:pairingState');
        const phase = this.attr('pairingDevice.pairdev:pairingPhase');
        return state === PAIRINGSTATE.PAIRING
          && (phase === PAIRINGPHASE.JOIN
            || phase === PAIRINGPHASE.CONNECT
            || phase === PAIRINGPHASE.IDENTIFY
            || phase === PAIRINGPHASE.PREPARE
            || phase === PAIRINGPHASE.CONFIGURE);
      },
    },
    /**
     * @property {String} grayBoxClasses
     * @parent i2web/components/pairing/device-state
     * @description list of ' ' separated css class names to be applied to the gray box container element
     */
    grayBoxClasses: {
      get() {
        const classes = [];
        if (this.attr('disableCustomize')) {
          classes.push('disabled');
        }
        return classes.join(' ');
      },
    },
    /**
     * @property {String} headerText
     * @parent i2web/components/pairing/device-state
     * @description the text to be displayed in the header
     */
    headerText: {
      get() {
        const product = this.attr('product');
        if (product) {
          return `${product['product:vendor']} ${product['product:name']}`;
        }
        return 'Device Found';
      },
    },
    /**
     * @property {String} subText
     * @parent i2web/components/pairing/device-state
     * @description the text to be displayed below the header
     */
    subText: {
      get() {
        const state = this.attr('pairingDevice.pairdev:pairingState');
        const phase = this.attr('pairingDevice.pairdev:pairingPhase');

        if (state === PAIRINGSTATE.PAIRING) {
          switch (phase) {
            case PAIRINGPHASE.JOIN:
            case PAIRINGPHASE.CONNECT:
              return 'Connecting to Device';
            case PAIRINGPHASE.IDENTIFY:
              return 'Discovering Device Features';
            case PAIRINGPHASE.PREPARE:
            case PAIRINGPHASE.CONFIGURE:
              return 'Writing Initial Settings';
            case PAIRINGPHASE.FAILED:
              return 'Improperly Paired';
            case PAIRINGPHASE.PAIRED:
              return 'Device Ready';
            default:
              return '';
          }
        } else if (state === PAIRINGSTATE.MISPAIRED
          || state === PAIRINGSTATE.MISCONFIGURED) {
          return 'Improperly Paired';
        } else if (state === PAIRINGSTATE.PAIRED) {
          return 'Device Ready';
        }

        return '';
      },
    },
    /**
     * @property {String} subTextIconClass
     * @parent i2web/components/pairing/device-state
     * @description the css class name that displays an icon on an element beneath the header text
     */
    subTextIconClass: {
      get() {
        switch (this.attr('pairingDevice.pairdev:pairingState')) {
          case PAIRINGSTATE.PAIRING:
            switch (this.attr('pairingDevice.pairdev:pairingPhase')) {
              case PAIRINGPHASE.FAILED:
                return 'error';
              case PAIRINGPHASE.PAIRED:
                return 'success';
              default:
                return 'loading';
            }
          case PAIRINGSTATE.MISPAIRED:
          case PAIRINGSTATE.MISCONFIGURED:
            return 'error';
          case PAIRINGSTATE.PAIRED:
            return 'success';
          default:
            return '';
        }
      },
    },
    /**
     * @property {String} productIconClass
     * @parent i2web/components/pairing/device-state
     * @description the class name that displays a particular product icon
     */
    productIconClass: {
      get() {
        const productConfig = productConfigs[this.attr('product.product:id')];
        const deviceType = this.attr('device.web:dev:devtypehint') ? this.attr('device.web:dev:devtypehint').toLowerCase() : '';
        const deviceConfig = deviceTypeConfigs[deviceType];

        return (productConfig && productConfig['web:icon:catalog'])
          || (deviceConfig && deviceConfig['web:icon:catalog'])
          || 'icon-app-device-found';
      },
    },
    /**
     * @property {Boolean} showCustomizeButton
     * @parent i2web/components/pairing/device-state
     * @description if the 'Customize' button should be shown
     */
    showCustomizeButton: {
      get() {
        const state = this.attr('pairingDevice.pairdev:pairingState');
        const phase = this.attr('pairingDevice.pairdev:pairingPhase');

        if (state === PAIRINGSTATE.PAIRING) {
          switch (phase) {
            case PAIRINGPHASE.JOIN:
            case PAIRINGPHASE.CONNECT:
            case PAIRINGPHASE.IDENTIFY:
            case PAIRINGPHASE.PREPARE:
            case PAIRINGPHASE.CONFIGURE:
            case PAIRINGPHASE.PAIRED:
              return true;
            default:
              return false;
          }
        } else if (state === PAIRINGSTATE.MISPAIRED
          || state === PAIRINGSTATE.MISCONFIGURED) {
          return false;
        } else if (state === PAIRINGSTATE.PAIRED) {
          return true;
        }

        return false;
      },
    },
    /**
     * @property {Boolean} showTryAgainButton
     * @parent i2web/components/pairing/device-state
     * @description if the 'Try Again' button should be shown
     */
    showTryAgainButton: {
      get() {
        return false; // I2-2103
        // The following to be uncommented in I2-1783
        // const state = this.attr('pairingDevice.pairdev:pairingState');
        // const phase = this.attr('pairingDevice.pairdev:pairingPhase');
        // return state === PAIRINGSTATE.MISPAIRED
        //   || state === PAIRINGSTATE.MISCONFIGURED
        //   || (state === PAIRINGSTATE.PAIRING && phase === PAIRINGPHASE.FAILED);
      },
    },
    /**
     * @property {Boolean} showRemoveButton
     * @parent i2web/components/pairing/device-state
     * @description if the 'Remove' button should be shown
     */
    showRemoveButton: {
      get() {
        const state = this.attr('pairingDevice.pairdev:pairingState');
        const phase = this.attr('pairingDevice.pairdev:pairingPhase');
        return state === PAIRINGSTATE.MISPAIRED
          || state === PAIRINGSTATE.MISCONFIGURED
          || (state === PAIRINGSTATE.PAIRING && phase === PAIRINGPHASE.FAILED);
      },
    },
  },
  /**
   * @function tagPairingState
   * @parent i2web/components/pairing/device-state
   * @description Keep analytics for all paired, misconfigured, and mispaired devices
   */
  tagPairingState() {
    const deviceState = this.attr('pairingDevice.pairdev:pairingState');
    const pairingStates = {
      [PAIRINGPHASE.PAIRED]: 'device.pairing.complete',
      [PAIRINGSTATE.MISPAIRED]: 'device.pairing.failed.mispaired',
      [PAIRINGSTATE.MISCONFIGURED]: 'device.pairing.failed.misconfigured',
    };
    if (pairingStates[deviceState]) {
      Analytics.tag(pairingStates[deviceState]);
    }
  },
});

export default Component.extend({
  tag: 'arcus-pairing-device-state',
  viewModel: DeviceStateVM,
  view,
  events: {
    inserted() {
      this.viewModel.tagPairingState();
    },
    '{pairingDevice} pairdev:pairingState': function onPairingStateChanged() {
      this.viewModel.tagPairingState();
    },
  },
});
