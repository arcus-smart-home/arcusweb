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

import Bridge from 'i2web/cornea/bridge';

/**
 * @module {Object} i2web/models/ProductCatalog ProductCatalog
 * @parent app.models.capabilities
 *
 * Model of a product catalog
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function GetProductCatalog
     *
     * Returns information about the product catalog for the context population.
     *
     * @return {Promise}
     */
    GetProductCatalog() {
      return Bridge.request('prodcat:GetProductCatalog', this.GetDestination(), {});
    },
    /**
     * @function GetCategories
     *
     * Returns a list of all the categories as a structure (name, image) referenced in this catalog as well as counts by category.  Nested catagories will be returned as fully qualified forward-slash delimited paths
     *
     * @return {Promise}
     */
    GetCategories() {
      return Bridge.request('prodcat:GetCategories', this.GetDestination(), {});
    },
    /**
     * @function GetBrands
     *
     * Returns a list of all the brands referenced in this catalog where each is a structure containing (name, image, description).  In addition the counts of products by brand name are returned.
     *
     * @return {Promise}
     */
    GetBrands() {
      return Bridge.request('prodcat:GetBrands', this.GetDestination(), {});
    },
    /**
     * @function GetProductsByBrand
     *
     * @param {string} brand
     * @return {Promise}
     */
    GetProductsByBrand(brand) {
      return Bridge.request('prodcat:GetProductsByBrand', this.GetDestination(), {
        brand,
      });
    },
    /**
     * @function GetProductsByCategory
     *
     * @param {string} category
     * @return {Promise}
     */
    GetProductsByCategory(category) {
      return Bridge.request('prodcat:GetProductsByCategory', this.GetDestination(), {
        category,
      });
    },
    /**
     * @function GetProducts
     *
     * @return {Promise}
     */
    GetProducts() {
      return Bridge.request('prodcat:GetProducts', this.GetDestination(), {});
    },
    /**
     * @function GetAllProducts
     *
     * Gets all products including those that are not browseable.
     *
     * @return {Promise}
     */
    GetAllProducts() {
      return Bridge.request('prodcat:GetAllProducts', this.GetDestination(), {});
    },
    /**
     * @function FindProducts
     *
     * @param {string} search
     * @return {Promise}
     */
    FindProducts(search) {
      return Bridge.request('prodcat:FindProducts', this.GetDestination(), {
        search,
      });
    },
    /**
     * @function GetProduct
     *
     * @param {string} id
     * @return {Promise}
     */
    GetProduct(id) {
      return Bridge.request('prodcat:GetProduct', this.GetDestination(), {
        id,
      });
    },
  },
  events: {},

};
