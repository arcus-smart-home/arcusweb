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

import $ from 'jquery';
import Component from 'can-component';
import CanMap from 'can-map';
import canRoute from 'can-route';
import 'can-map-define';
import { first, last, trim, words } from 'lodash';
import Place from 'i2web/models/place';
import ProductCatalogService from 'i2web/models/service/ProductCatalogService';
import Errors from 'i2web/plugins/errors';
import view from './search.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Place} place
     * @parent i2web/components/catalog/search
     * @description Current place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Object} selectedProduct
     * @parent i2web/components/catalog/search
     * @description The product result from the User selected product address
     */
    selectedProduct: {
      get() {
        const address = this.attr('selectedProductAddress');
        const results = this.attr('searchResults');
        if (address && results) {
          return this.attr('searchResults').find((r) => {
            return r['base:address'] === address;
          });
        }
        return undefined;
      },
    },
    /**
     * @property {String} selectedProductAddress
     * @parent i2web/components/catalog/search
     * @description Base address of product selected during search
     */
    selectedProductAddress: {
      type: 'string',
    },
    /**
     * @property {Array} searchResults
     * @parent i2web/components/catalog/search
     * @description Holds the search results returned by the API
     */
    searchResults: {
      type: '*',
    },
    /**
     * @property {string} filterMode
     * @parent i2web/components/catalog/search
     * @description the keyword representing the state of the filter controls
     */
    filterMode: {
      type: 'string',
      get() {
        const action = canRoute.attr('action');
        if (action === 'no-hub-setup') {
          return 'no-hub-required';
        }
        return canRoute.attr('action') || 'all';
      },
      set(val) { canRoute.attr('action', val); },
    },
  },
  /**
   * @function getProductTitle
   * @parent i2web/components/catalog/search
   * @description Returns the product title
   */
  getProductTitle(product) {
    const vendor = product['product:vendor'];
    const short = product['product:name'];
    const shortNameWords = words(short);

    return (last(words(vendor)) === first(shortNameWords))
      ? `${vendor} ${trim(short.replace(first(shortNameWords), ''))}`
      : `${vendor} ${short}`;
  },
  /**
   * @function search
   * @parent i2web/components/catalog/search
   * @description Makes a request to the server with the search term and fetches the products
   */
  search(term) {
    const place = this.attr('place.base:address');
    ProductCatalogService.FindProducts(place, term).then((results) => {
      this.attr('searchResults', results.products);
    }).catch(e => Errors.log(e));
  },
  /**
   * @function setFilterMode
   * @parent i2web/components/catalog/search
   * @description Change the state of the filtering mode property
   */
  setFilterMode(keyword) {
    this.attr('filterMode', keyword);
  },
});

export default Component.extend({
  tag: 'arcus-catalog-search',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel searchResults} change': function searchResultsUpdated() {
      const select = $(this.element).find('select');
      $(select).dropdown('refresh');
    },
    'input.search keyup': function onKeyUp(el, ev) {
      if (ev.which === 13) {
        const selectedProduct = $(el).val();
        this.viewModel.search(selectedProduct);
      }
    },
  },
});
