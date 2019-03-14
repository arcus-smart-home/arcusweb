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
import categoryIcons from 'config/category-icons.json';
import Errors from 'i2web/plugins/errors';
import Place from 'i2web/models/place';
import ProductCatalogService from 'i2web/models/service/ProductCatalogService';
import view from './products.stache';
import _ from 'lodash';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {String} groupType
     * @parent i2web/components/catalog/products
     * @description The current group type from the product catalog view, that is, brand or category
     */
    groupType: {
      type: 'string',
    },
    /**
     * @property {Place} place
     * @parent i2web/components/catalog/products
     * @description Current user's place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Array} products
     * @parent i2web/components/catalog/products
     * @description List of products to display
     */
    products: {
      get(lastSetVal, setAttr) {
        const place = this.attr('place.base:address');
        const productFn = (this.attr('groupType') === 'brands')
          ? 'GetProductsByBrand'
          : 'GetProductsByCategory';

        ProductCatalogService[productFn](place, this.attr('selectedGroup'))
          .then(resp => setAttr(resp.products))
          .catch(e => Errors.log(e));
        return [];
      },
    },
    /**
     * @property {Array} products
     * @parent i2web/components/catalog/products
     * @description List of products to display matching the filtered product class
     */
    filteredProducts: {
      get() {
        const products = this.attr('products');
        const filterMode = this.attr('filterMode');
        const hubRequired = filterMode === 'hub-required';
        const noHubRequired = filterMode === 'no-hub-required';

        return _.filter(products, (p) => {
          if (hubRequired) {
            return p['product:hubRequired'];
          } else if (noHubRequired) {
            return !p['product:hubRequired'];
          }

          return true;
        });
      },
    },
    /**
     * @property {String} selectedGroup
     * @parent i2web/components/catalog/products
     * @description The current group selected from the product catalog view, that is, a specific brand or category
     */
    selectedGroup: {
      type: 'string',
    },
    /**
     * @property {string} selectedProductAddress
     * @parent i2web/components/catalog/products
     * @description Currently selected product's base address
     */
    selectedProduct: {
      Type: CanMap,
    },
    /**
     * @property {String} title
     * @parent i2web/components/catalog/products
     * @description The title for the product listing page
     */
    title: {
      get() {
        const groupName = this.attr('selectedGroup');
        if (groupName) {
          if (this.attr('groupType') === 'brands') {
            return `${groupName} Devices`;
          }
          const icon = categoryIcons[groupName];
          return `<i class="${icon}"></i>${groupName}`;
        }
        return 'Add a Device';
      },
    },

    /**
     * @property {String} filterMode
     * @parent i2web/components/catalog/products
     * @description A filter keyword representing a class of products chosen by the user
     */
    filterMode: {
      type: 'string',
    },
  },
  /**
   * @function selectProduct
   * @parent i2web/components/catalog/categories
   * @param product The selected product
   * @description Triggered when a product is selected.
   */
  selectProduct(product) {
    this.attr('selectedProduct', product);
  },
});

export default Component.extend({
  tag: 'arcus-catalog-products',
  viewModel: ViewModel,
  view,
});
