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
import Analytics from 'i2web/plugins/analytics';
import canDev from 'can-util/js/dev/';
import CanMap from 'can-map';
import CategoryIcons from 'config/category-icons.json';
import Component from 'can-component';
import { deviceTypeConfig as deviceTypeConfigs, productConfig as productConfigs } from 'config/device';
import find from 'lodash/find';
import getAppState from 'i2web/plugins/get-app-state';
import { isMobileBrowser, isIE11 } from 'i2web/helpers/global';
import view from './selectable.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Function} advance
     * @parent i2web/components/catalog/selectable
     * @description function called with the model represented by this component when selected and no errors are present.
     */
    advance: {
      Type: Function,
      value: () => () => { canDev.warn(`arcus-catalog-selectable: No 'advance' handler function provided.`); },
    },
    /**
     * @property {String} brandLogoURL
     * @parent i2web/components/catalog/selectable
     * @description URL for the brand logo to be displayed, or undefined
     */
    brandLogoURL: {
      get() {
        const brandName = this.attr('brandName');
        if (brandName && brandName !== '') {
          const baseURL = getAppState().attr('session.secureStaticResourceBaseUrl');
          const brand = brandName.replace(/\W*/g, '').toLowerCase();
          return `${baseURL}/o/brands/${brand}/brand.svg`;
        }
        return undefined;
      },
    },
    /**
     * @property {String} brandName
     * @parent i2web/components/catalog/selectable
     * @description the brand name associated with the model being represented by this component
     */
    brandName: {
      get() {
        switch (this.attr('thingType')) {
          case 'brand':
            return this.attr('thing.name');
          case 'product':
            return this.attr('thing.product:vendor');
          case 'category':
          default:
            return '';
        }
      },
    },
    /**
     * @property {String} containerClasses
     * @parent i2web/components/catalog/selectable
     * @description a string of classes to be added to the .selectable-container element
     */
    containerClasses: {
      get() {
        const classes = [];
        switch (this.attr('thingType')) {
          case 'brand':
            classes.push('brand-only');
            break;
          case 'category':
            classes.push('no-brand');
            break;
          default:
            break;
        }
        if (this.attr('isShowingError')) {
          classes.push('has-error');
        }
        return classes.join(' ');
      },
    },
    /**
     * @property {String} error
     * @parent i2web/components/catalog/selectable
     * @description codename for the error that prevents this product from being paired or null if no errors
     */
    error: {
      type: 'string',
      get() {
        const hub = getAppState().attr('hub');

        if (this.attr('thing.product:pairingMode') === 'OAUTH' && isIE11()) {
          return 'supported-browser-required';
        }

        if (this.attr('thing.product:hubRequired')) {
          if (!hub) return 'hub-required';
          if (hub.attr('isOffline')) return 'hub-offline';
        }

        if (this.attr('thing.product:appRequired') || this.isOauthDeviceOnMobile()) {
          if (this.attr('thing.product:appRequired')) {
            Analytics.tag('device.pairing.apprequired');
          }
          return 'mobile-pairing';
        }

        if (this.attr('thing.product:devRequired')) {
          const intermediaryDeviceID = this.attr('thing.product:devRequired');
          const matchingDevice = find(getAppState().attr('devices'), (device) => {
            return device['dev:productId'] === intermediaryDeviceID;
          });
          if (!matchingDevice) {
            return 'intermediary-missing';
          } else if (matchingDevice.attr('isOffline')) {
            return 'intermediary-offline';
          }
        }
        return null;
      },
    },
    /**
     * @property {String} iconName
     * @parent i2web/components/catalog/selectable
     * @description Appropriate icon for the thing, used for categories, or for a product when no product image exists
     */
    iconName: {
      get() {
        if (this.attr('thingType') === 'category') {
          return CategoryIcons[this.attr('thingName')];
        } else if (this.attr('thingType') === 'product') {
          let deviceConfig;
          const productConfig = productConfigs[this.attr('thing.base:id')];
          if (this.attr('thing.product:screen')) {
            const screenType = _.replace(_.lowerCase(this.attr('thing.product:screen')), /[^0-9a-zA-Z]/g, '');
            deviceConfig = deviceTypeConfigs[screenType];
          }

          return (productConfig && productConfig['web:icon:catalog'])
            || (deviceConfig && deviceConfig['web:icon:catalog'])
            || 'icon-app-devices';
        }
        // else no icon is shown for BRAND
        return '';
      },
    },
    /**
     * @property {String} intermediaryName
     * @parent i2web/components/catalog/selectable
     * @description the name of the intermediary device required by the product being represented by this component
     */
    intermediaryName: {
      get() {
        const intermediaryID = this.attr('thing.product:devRequired');

        if (intermediaryID) {
          const product = getAppState().attr(`products.${intermediaryID}`);
          if (product) {
            return product.attr('product:shortName');
          }
        }
        return '';
      },
    },
    /**
     * @property {boolean} isShowingError
     * @parent i2web/components/catalog/selectable
     * @description if the selectable element is displaying an error. only shown upon clicking the element
     */
    isShowingError: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {String} placeholderIconClass
     * @parent i2web/components/catalog/selectable
     * @description CSS classname for product icon
     */
    placeholderIconClass: {
      type: 'string',
      value: 'no-icon',
    },
    /**
     * @property {String} productImageClass
     * @parent i2web/components/catalog/selectable
     * @description CSS classname for product image
     */
    productImageClass: {
      type: 'string',
      value: 'no-image',
    },
    /**
     * @property {String} productImageURL
     * @parent i2web/components/catalog/selectable
     * @description URL for the product image to be displayed, undefined if none exists
     */
    productImageURL: {
      get() {
        if (this.attr('thingType') === 'product' && _.lowerCase(this.attr('thing.product:vendor')) === 'arcus') {
          const baseURL = getAppState().attr('session.secureStaticResourceBaseUrl');
          const productId = this.attr('thing.product:id');
          return `${baseURL}/o/products/${productId}/product_large_color-web.png`;
        }
        return undefined;
      },
    },
    /**
     * @property {CanMap} thing
     * @parent i2web/components/catalog/selectable
     * @description the selectable brand, category or product being represented by this component
     */
    thing: {
      Type: CanMap,
    },
    /**
     * @property {String} thingName
     * @parent i2web/components/catalog/selectable
     * @description the name of the model being represented by this component
     */
    thingName: {
      get() {
        switch (this.attr('thingType')) {
          case 'brand':
          case 'category':
            return this.attr('thing.name');
          case 'product':
            return this.attr('thing.product:name');
          default:
            return '';
        }
      },
    },
    /**
     * @property {String} thingNameContainerColor
     * @parent i2web/components/catalog/selectable
     * @description a css class name that forces a particular color on the bottom container
     */
    thingNameContainerClass: {
      get() {
        if (this.attr('isShowingError')) {
          switch (this.attr('error')) {
            case 'hub-required':
            case 'mobile-pairing':
            case 'intermediary-missing':
            case 'supported-browser-required':
              return 'unpairable';
            case 'intermediary-offline':
            case 'hub-offline':
              return 'offline';
            default:
              return '';
          }
        }
        return '';
      },
    },
    /**
     * @property {String} thingType
     * @parent i2web/components/catalog/selectable
     * @description the type of selectable: BRAND, CATEGORY or PRODUCT
     */
    thingType: {
      type: 'string',
      value: 'product',
      set(value) {
        return _.lowerCase(value);
      },
    },
  },
  /**
   * @function imageFound
   * @description Callback for when the product image is fully loaded
   */
  imageFound() {
    this.attr('productImageClass', '');
    this.attr('placeholderIconClass', 'no-icon');
  },
  /**
   * @function imageNotFound
   * @description Error handler for when the product image cannot be loaded
   */
  imageNotFound() {
    this.attr('productImageClass', 'no-image');
    this.attr('placeholderIconClass', 'coming-soon');
  },
  /**
   * @function isOauthDeviceOnMobile
   * @parent i2web/components/catalog/selectable
   * Whether user is trying to pair an OAUTH device on a mobile browser
   */
  isOauthDeviceOnMobile() {
    const product = this.attr('thing');
    return isMobileBrowser() &&
      (product.attr('product:pairingMode') === 'OAUTH' ||
        (_.toUpper(product.attr('product:pairingMode')) === 'BRIDGED_DEVICE' &&
          _.toUpper(product.attr('product:protoFamily')) === 'LUTRON'));
  },
  onSelect() {
    // if we have an error, show it upon selection, or call `advance` action handler
    if (this.attr('error')) {
      this.attr('isShowingError', true);
    } else {
      const model = this.attr('thing');
      this.attr('advance')(model);
    }
  },
});

export default Component.extend({
  tag: 'arcus-catalog-selectable',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel} error': function viewModelError(vm, ev, val) {
      // if we're showing the error overlay and we end up fixing the error state, hide the overlay
      if (vm.attr('isShowingError') && val === null) {
        vm.attr('isShowingError', false);
      }
    },
  },
});
