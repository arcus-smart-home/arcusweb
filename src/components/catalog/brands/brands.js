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
import view from './brands.stache';
import ProductCatalogService from 'i2web/models/service/ProductCatalogService';
import Place from 'i2web/models/place';
import Errors from 'i2web/plugins/errors';
import getAppState from 'i2web/plugins/get-app-state';
import each from 'lodash/each';
import intersectionBy from 'lodash/intersectionBy';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Array} brands
     * @parent i2web/components/catalog/brands
     * @description A list of brands based on the current place
     */
    brands: {
      get(lastSetVal, resolve) {
        const baseAddress = this.attr('place.base:address');
        ProductCatalogService.GetBrands(baseAddress)
          .then(res => resolve(res.brands))
          .catch(Errors.log);
        return lastSetVal || [];
      },
    },
    /**
     * @property {Array} filteredBrands
     * @parent i2web/components/catalog/brands
     * @description A list of brands that include the class of product we're filtering for
     */
    filteredBrands: {
      get() {
        const filterMode = this.attr('filterMode');
        const isHubFiltering = filterMode === 'hub-required' || filterMode === 'no-hub-required';
        let brands = this.attr('brands');

        if (isHubFiltering) {
          const brandsWithHubProducts = new Set();
          const brandsWithNonHubProducts = new Set();
          const products = Object.values(getAppState().attr('products').attr());

          each(products, (p) => {
            if (p['product:hubRequired']) {
              brandsWithHubProducts.add(p['product:vendor']);
            } else {
              brandsWithNonHubProducts.add(p['product:vendor']);
            }
          });

          if (filterMode === 'hub-required') {
            brands = intersectionBy(brands, Array.from(brandsWithHubProducts), b => b.name || b);
          } else if (filterMode === 'no-hub-required') {
            brands = intersectionBy(brands, Array.from(brandsWithNonHubProducts), b => b.name || b);
          }
        }

        return brands;
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/catalog/brands
     * @description Current place for the user
     */
    place: {
      Type: Place,
    },
    /**
     * @property {String} selectedBrand
     * @parent i2web/components/catalog/brands
     * @description The brand selected by the user
     */
    selectedBrand: {
      type: 'string',
    },

    /**
     * @property {String} filterMode
     * @parent i2web/components/catalog/brands
     * @description A filter keyword representing a class of products chosen by the user
     */
    filterMode: {
      type: 'string',
    },
  },
  /**
   * @function selectBrand
   * @parent i2web/components/catalog/brands
   * @description Triggered when a brand is selected.
   */
  selectBrand(brand) {
    this.attr('selectedBrand', brand.name);
  },
});

export default Component.extend({
  tag: 'arcus-catalog-brands',
  viewModel: ViewModel,
  view,
});
