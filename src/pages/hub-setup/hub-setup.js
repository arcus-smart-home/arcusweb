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
import canRoute from 'can-route';
import 'can-map-define';
import getAppState from 'i2web/plugins/get-app-state';
import HubProductGroups from 'config/hub-product-groups.json';
import Place from 'i2web/models/place';
import view from './hub-setup.stache';

const KIT_HUB_MAP = {
  KITPROMON: 'dee000',
  KITSAFESEC: 'dee001',
};

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {string} activeDisplay
     * @parent i2web/pages/hub-setup
     * @description The active display of the hub-setup page
     */
    activeDisplay: {
      get() {
        const subpage = canRoute.attr('subpage');
        const page = canRoute.attr('page');
        const defaultSubpage = 'product-groups';
        const validSubpages = [defaultSubpage, 'yes-no'];
        if (page === 'hub-setup' && validSubpages.indexOf(subpage) === -1) {
          canRoute.attr('subpage', defaultSubpage);
          return defaultSubpage;
        }
        return subpage || defaultSubpage;
      },
    },
    /**
     * @property {Place} place
     * @parent i2/web/pages/hub-setup
     * @description The place we are pairing devices or a Hub
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Place} productGroups
     * @parent i2/web/pages/hub-setup
     * @description The place we are pairing devices or a Hub
     */
    productGroups: {
      get() {
        return HubProductGroups;
      },
    },
    /**
     * @property {String} productImageBaseURL
     * @parent i2/web/pages/hub-setup
     * @description Base URL for the product image to be displayed
     */
    productImageBaseURL: {
      get() {
        return getAppState().attr('session.secureStaticResourceBaseUrl');
      },
    },
    /**
     * @property {*} selectPairingProduct
     * @parent i2/web/pages/hub-setup
     * @description Method provided by parent page; invoked once user-selected hub product is identified
     */
    selectPairingProduct: {
      type: '*',
    },
    /**
     * @property {string} title
     * @parent i2/web/pages/hub-setup
     * @description The title displayed on the page
     */
    title: {
      get() {
        if (this.attr('activeDisplay') === 'yes-no') {
          return 'Do you have a Smart Hub/Starter Kit?';
        }
        return 'Hubs & Starter Kits';
      },
    },
  },
  /**
   * @property {Object} route
   * @parent i2/web/pages/hub-setup
   * @description the canRoute module, used for binding to events
   */
  route: canRoute,
  /**
   * @function
   * @parent i2/web/pages/hub-setup
   * @description Invoked when user presses BACK, going back to Yes-No choice, or Dashboard
   */
  routeBackFromProductGroups() {
    if (this.attr('exposeYesNo')) {
      canRoute.attr('subpage', 'yes-no');
    } else {
      this.routeToDashboard();
    }
  },
  /**
   * @function routeToDashboard
   * @parent i2/web/pages/hub-setup
   * @description Routes to Dashboard
   */
  routeToDashboard() {
    canRoute.attr({ page: 'home', subpage: undefined, action: undefined });
  },
  /**
   * @function routeToProductGroups
   * @parent i2/web/pages/hub-setup
   * @description Routes to the Product Groups page, allowing user to select hub or kit
   */
  routeToProductGroups() {
    canRoute.attr('subpage', 'product-groups');
  },
  /**
   * @function routeToProductCatalog
   * @parent i2/web/pages/hub-setup
   * @description Routes to Product Catalog page, allowing user to choose a product for pairing
   */
  routeToProductCatalog() {
    const subsystems = getAppState().attr('subsystems');
    subsystems.findByName('subpairing').DismissAll();
    canRoute.attr({ page: 'product-catalog', subpage: 'brands', action: 'no-hub-setup' });
  },
  /**
   * @function selectProduct
   * @parent i2/web/pages/hub-setup
   * @description Invoked when user selects a hub or starter kit from the list
   */
  selectProduct(productId) {
    // If kit selected, choose hub product from mapping; otherwise, use hub productId
    const hubId = KIT_HUB_MAP[productId.toUpperCase()] || productId;
    const product = getAppState().attr(`products.${hubId}`);
    this.selectPairingProduct(product, 'hub');
  },
});

export default Component.extend({
  tag: 'arcus-page-hub-setup',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      const subpage = canRoute.attr('subpage');
      this.viewModel.attr('exposeYesNo', subpage === 'yes-no');
    },
  },
});
