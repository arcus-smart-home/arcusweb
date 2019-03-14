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

import getAppState from 'i2web/plugins/get-app-state';
import Component from 'can-component';
import CanMap from 'can-map';
import CanList from 'can-list';
import 'can-map-define';
import canRoute from 'can-route';
import find from 'lodash/find';
import Hub from 'i2web/models/hub';
import Incident from 'i2web/models/incident';
import CareSubsystem from 'i2web/models/capability/CareSubsystem';
import PairingDevice from 'i2web/models/capability/PairingDevice';
import Place from 'i2web/models/place';
import view from './product-catalog.stache';
import Errors from 'i2web/plugins/errors';
import Notifications from 'i2web/plugins/notifications';
import { isMobileBrowser, isIE11 } from 'i2web/helpers/global';
import { partition } from 'lodash';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {String} careAlarmState
     * @parent i2web/pages/product-catalog
     * @description If there is an 'ALERT' turn off pairing mode on the Hub
     */
    careAlarmState: {
      type: 'string',
      set(state) {
        if (state === CareSubsystem.ALARMSTATE_ALERT) {
          this.attr('subsystem').StopSearching().catch(Errors.log);
        }
        return state;
      },
    },
    /**
     * @property {Incident} currentIncident
     * @parent i2web/pages/product-catalog
     * @description If there is an active incident, this will be defined
     */
    currentIncident: {
      Type: Incident,
    },
    /**
     * @property {String} currentSubpage
     * @parent i2web/pages/product-catalog
     * @description The current subpage of the product catalog
     */
    currentSubpage: {
      get() {
        return canRoute.attr('subpage');
      },
    },
    /**
     * @property {CanList} devices
     * @parent i2web/pages/product-catalog
     * @description The list of devices on the place
     */
    devices: {
      get() {
        return getAppState().attr('devices');
      },
    },
    /**
     * @property {Boolean} dismissAllCalled
     * @parent i2web/pages/product-catalog
     * @description DismissAll has been called on the subystem. This is used as a sentinal
     * value to ensure we use the same exit function, but to keep the platform calls
     * to a minimum
     */
    dismissAllCalled: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Array<Object>} dismissCompletionSteps
     * @parent i2web/pages/product-catalog
     * @description The actions for the User to take after a call to DismissAll
     */
    dismissCompletionSteps: {
      Type: Array,
    },
    /**
     * @property {String} filterMode
     * @parent i2web/pages/product-catalog
     * @description A filter keyword representing a class of products chosen by the user
     */
    filterMode: {
      type: 'string',
    },
    /**
     * @property {Boolean} hasUnpairedDevices
     * @parent i2web/pages/product-catalog
     * @description The subsystem currently has PairingDevices not in the PAIRED state
     */
    hasUnpairedDevices: {
      get() {
        const pairingDevices = this.attr('pairingDevices');
        if (pairingDevices) {
          const unpaired = pairingDevices.filter((device) => {
            return device.attr('pairdev:pairingState') !== PairingDevice.PAIRINGSTATE_PAIRED;
          });
          return unpaired.attr('length') > 0;
        }
        return false;
      },
    },
    /**
     * @property {Hub} hub
     * @parent i2web/pages/product-catalog
     */
    hub: {
      Type: Hub,
    },
    /**
     * @property {Number} mispairedDeviceCount
     * @parent i2web/pages/product
     * @description The number of mispaired or misconfigured devices
     */
    mispairedDeviceCount: {
      type: 'number',
    },
    /**
     * @property {String} pageTitle
     * @parent i2web/pages/product-catalog
     * @description The title string displayed below the stages progress bar
     */
    pageTitle: {
      type: 'string',
      value: 'Add a Device',
    },
    /**
     * @property {CanList<PairingDevice>} pairingDevices
     * @parent i2web/pages/product-catalog
     * @description The list of PairingDevice objects held by the pairing subsystem.
     * Loaded from the server at first read. Kept in sync by 'pairdev base:Added' events.
     */
    pairingDevices: {
      Type: CanList,
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/product-catalog
     * @description The place whose population should be used for
     * getting the categories
     */
    place: {
      Type: Place,
    },
    /**
     * @property {String} selectedGroup
     * @parent i2web/pages/product-catalog
     * @description The current group selected of the product catalog view, that is, a brand or category
     */
    selectedGroup: {
      type: 'string',
    },
    /**
     * @property {Product} selectedProduct
     * @parent i2web/pages/product-catalog
     * @description The product chosen by the user
     */
    selectedProduct: {
      Type: CanMap,
    },
    /**
     * @property {boolean} showEntryPrompt
     * @parent i2web/pages/product
     * @description Show a modal to prompt the user to repair or configure unpaired
     * devices
     */
    showEntryPrompt: {
      get(lastSetValue) {
        // so that we can set it manually
        if (lastSetValue !== undefined) return lastSetValue;
        return this.attr('mispairedDeviceCount') > 0
          || this.attr('unactivatedDeviceCount') > 0;
      },
    },
    /**
     * @property {boolean} showKittingBackButton
     * @parent i2web/pages/product
     * @description flag to show the back button that returns a user to the hub pairing flow
     */
    showKittingBackButton: {
      get() {
        const hasSelectedGroup = this.attr('selectedGroup');
        const action = canRoute.attr('action');
        return action && action === 'no-hub-setup' && !hasSelectedGroup;
      },
    },
    /**
     * @property {Array<String>} stages
     * @parent i2web/pages/product-catalog
     * @description The stages to be shown in the staged progress bar
     */
    stages: {
      value: ['discover', 'connect', 'customize'],
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2ewb/pages/product-catalog
     * @description The pairing subsystem
     */
    subsystem: {
      get() {
        return getAppState().attr('subsystems').findByName('subpairing');
      },
    },
    /**
     * @property {number} totalProductCount
     * @parent i2web/pages/product-catalog
     * @description the number of products available in the catalog
     */
    totalProductCount: {
      type: 'number',
      get() {
        const filterMode = this.attr('filterMode');
        let products = Object.values(getAppState().attr('products').attr());

        if (filterMode === 'hub-required') {
          products = products.filter(p => p['product:hubRequired']);
        } else if (filterMode === 'no-hub-required') {
          products = products.filter(p => !p['product:hubRequired']);
        }
        // remove the v2 and v3 hubs added in application state
        return products.filter(p => p['product:canBrowse']).length;
      },
    },
    /**
     * @property {Number} unactivatedDeviceCount
     * @parent i2web/pages/product
     * @description The number of unactivated devices
     */
    unactivatedDeviceCount: {
      type: 'number',
    },
  },
  route: canRoute,
  /**
   * @function clearSelectedGroup
   * @parent i2web/pages/product-catalog
   * @description Clears the selected group to allow for another choice
   */
  clearSelectedGroup() {
    this.attr('selectedGroup', undefined);
    this.attr('pageTitle', 'Add a Device');
  },
  /**
   * @function {Boolean} currentSubpageIs
   * @parent i2web/pages/product-catalog
   * @param {String} currentSubpage The subpagestring to check against
   * @description Is the current subpage equal to the provided subpage string
   */
  currentSubpageIs(currentSubpage) {
    return canRoute.attr('subpage') === currentSubpage;
  },
  /**
   * @function doAdvancedPairing
   * @parent i2web/pages/product-catalog
   * @description Start a pairing search without any particular product address in
   * order to find multiple devices
   */
  doAdvancedPairing() {
    this.selectPairingProduct(null);
    canRoute.attr({ page: 'pairing', subpage: 'device', action: 'advanced' });
  },
  /**
   * @function exitPairing
   * @parent i2web/pages/product-catalog
   * @description Exit to the app location prior to starting the pairing process;
   * will also take the hub out of pairing mode in case the user arrived on this screen
   * in the midst of a pairing session
   */
  exitPairing() {
    if (this.attr('pairingDevices.length')) {
      this.attr('showExitPrompt', true);
    } else {
      this.onConfirmExitPairing();
    }
  },
  /**
   * @function canPairProduct
   * @parent i2web/pages/product-catalog
   * @description Checks if app or intermediary device is required to pair this device
   */
  canPairProduct() {
    const product = this.attr('selectedProduct');
    const hub = getAppState().attr('hub');

    if (product.attr('product:pairingMode') === 'OAUTH' && isIE11()) {
      Notifications.warning('Use a supported browser such as Microsoft Edge or Google Chrome to pair this device.', 'icon-platform-warning-2');
      return false;
    }

    if (product.attr('product:hubRequired')) {
      if (!hub) {
        Notifications.warning('A Hub is required to pair this device', 'icon-platform-warning-2');
        return false;
      } else if (hub.attr('isOffline')) {
        Notifications.error('Hub Offline. Re-connect your Hub and then try to pair this device.', 'icon-platform-warning-2');
        return false;
      }
    }

    if (product.attr('product:appRequired') || this.isOauthDeviceOnMobile()) {
      if (product.attr('product:appRequired')) {
        Notifications.warning(
          'Use the Mobile app to pair this device.',
          'icon-platform-warning-2',
        );
      }
      return false;
    }

    if (product.attr('product:devRequired')) {
      const intermediaryDeviceID = product.attr('product:devRequired');
      const matchingDevice = find(this.attr('devices'), (device) => {
        return device['dev:productId'] === intermediaryDeviceID;
      });
      const intermediaryDevice = getAppState().attr(`products.${intermediaryDeviceID}`);
      let intermediaryDeviceName = '';

      if (intermediaryDevice) {
        intermediaryDeviceName = intermediaryDevice.attr('product:shortName');
      }

      if (!matchingDevice) {
        Notifications.warning(`${intermediaryDeviceName} must be paired before pairing this device.`, 'icon-platform-warning-2');
        return false;
      } else if (matchingDevice.attr('isOffline')) {
        Notifications.error(`${intermediaryDeviceName} is offline. Re-connect it and then try to pair this device.`, 'icon-platform-warning-2');
        return false;
      }
    }
    return true;
  },
  /**
   * @function onConfirmExitPairing
   * @parent i2web/pages/product-catalog
   * @description The User has confirmed they wish to exit, so dismiss any
   */
  onConfirmExitPairing() {
    if (!this.attr('dismissAllCalled')) {
      this.attr('subsystem').DismissAll().then(({ actions }) => {
        this.attr('dismissAllCalled', true);
        this.attr('showExitPrompt', false);
        if (actions.length) {
          this.attr('dismissCompletionSteps', actions);
        } else {
          this.routeToDashboard();
        }
      }).catch(Errors.log);
    } else {
      this.routeToDashboard();
    }
  },
  /**
   * @function onFinishActivation
   * @parent i2web/pages/product-catalog
   * @description The User has confirmed they wish to finish activating a kit
   */
  onFinishActivation() {
    this.attr('showEntryPrompt', false);
    if (this.attr('hub.isOffline')) {
      Notifications.error('Hub Offline. Re-connect your Hub and then try to pair.', 'icon-platform-warning-2');
    } else {
      canRoute.attr({ page: 'kit-activate', subpage: undefined, action: undefined });
    }
  },
  /**
   * @function isOauthDeviceOnMobile
   * @parent i2web/pages/product-catalog
   * Whether user is trying to pair an OAUTH device on a mobile browser
   */
  isOauthDeviceOnMobile() {
    const product = this.attr('selectedProduct');
    return isMobileBrowser() &&
      (product.attr('product:pairingMode') === 'OAUTH' ||
        (product.attr('product:pairingMode') === 'BRIDGED_DEVICE' &&
          product.attr('product:protoFamily') === 'LUTRON'));
  },
  /**
   * @function onResumeCatalogBrowse
   * @parent i2web/pages/product-catalog
   * @description The User has confirmed they wish to resume browsing the catalog without finishing kit activation
   */
  onResumeCatalogBrowse() {
    this.attr('showEntryPrompt', false);
  },
  /**
   * @function onResumePairing
   * @parent i2web/pages/product-catalog
   * @description Close the exit prompt and resume the pairing process
   */
  onResumePairing() {
    this.attr('showExitPrompt', false);
  },
  /**
   * @function routeToDashboard
   * @parent i2web/pages/pairing
   * @description When exiting pairing route the User to the dashboard
   */
  routeToDashboard() {
    this.attr('dismissAllCalled', true);
    this.attr('subsystem').StopSearching().catch(Errors.log);
    canRoute.attr({ page: 'home', subpage: undefined, action: undefined });
  },
  /**
   * @function routeToHubPairing
   * @parent i2web/pages/pairing
   * @description route the user to the preceding hub pairing stage
   */
  routeToHubPairing() {
    canRoute.attr({ page: 'hub-setup', subpage: 'yes-no', action: undefined });
  },
});

export default Component.extend({
  tag: 'arcus-page-product-catalog',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      if (!canRoute.attr('subpage')) { canRoute.attr('subpage', 'brands'); }

      const action = canRoute.attr('action');
      if (action && action === 'no-hub-setup') {
        this.viewModel.attr('showKittingBackButton', true);
      }

      const subsystem = this.viewModel.attr('subsystem');
      subsystem.ListPairingDevices()
        .then(({ devices }) => {
          const partitionKitOrNot = partition(devices, ((d) => {
            return !d['base:tags'] || !d['base:tags'].includes('KIT');
          }));

          const filtered = partitionKitOrNot[0].filter((d) => {
            const address = d['base:address'];
            return subsystem.attr('subpairing:pairingDevices').attr().includes(address)
              || d['pairdev:pairingState'] !== PairingDevice.PAIRINGSTATE_PAIRED;
          });
          this.viewModel.attr('pairingDevices', new CanList(filtered));

          const mispaired = devices.filter((d) => {
            return d['pairdev:pairingState'] === PairingDevice.PAIRINGSTATE_MISCONFIGURED
              || d['pairdev:pairingState'] === PairingDevice.PAIRINGSTATE_MISPAIRED;
          });
          this.viewModel.attr('mispairedDeviceCount', mispaired.length);

          if (partitionKitOrNot[1].length) {
            const unactivated = partitionKitOrNot[1].filter((d) => {
              return d['pairdev:pairingState'] === PairingDevice.PAIRINGSTATE_PAIRING;
            });
            this.viewModel.attr('unactivatedDeviceCount', unactivated.length);
          }
        })
        .catch(e => Errors.log(e));
    },
    '{viewModel} selectedProduct': function productSelected() {
      const product = this.viewModel.attr('selectedProduct');

      if (product && product.attr('base:address') && this.viewModel.canPairProduct()) {
        this.viewModel.selectPairingProduct(product);
      }
    },
    '{route} page': function pageChanged(app) {
      const page = app.attr('page');
      const subpage = app.attr('subpage');
      if (page !== 'services' && subpage !== 'alarms') {
        if (page !== 'pairing' && page !== 'product-catalog' && page !== 'hub-setup' && page !== 'kit-activate') {
          this.viewModel.onConfirmExitPairing();
        }
      }
    },
  },
});
