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
 * @module {Object} i2web/models/ProductCatalogService ProductCatalogService
 * @parent app.models.services
 *
 * Service methods for retrieving the product catalog.
 */
export default {
  /**
   * @function GetProductCatalog
   *
   * Returns information about the product catalog for the context population.
   *
   * @param {string} [place] The place whose population should be used for getting the product catalog
   * @return {Promise}
   */
  GetProductCatalog(place) {
    return Bridge.restfulRequest('prodcat:GetProductCatalog', 'SERV:prodcat:', {
      place,
    });
  },
  /**
   * @function GetCategories
   *
   * Returns a list of all the categories as a structure (name, image) referenced in this catalog as well as counts by category.  Nested catagories will be returned as fully qualified forward-slash delimited paths
   *
   * @param {string} [place] The place whose population should be used for getting the categories
   * @return {Promise}
   */
  GetCategories(place) {
    return Bridge.restfulRequest('prodcat:GetCategories', 'SERV:prodcat:', {
      place,
    });
  },
  /**
   * @function GetBrands
   *
   * Returns a list of all the brands referenced in this catalog where each is a structure containing (name, image, description).  In addition the counts of products by brand name are returned.
   *
   * @param {string} [place] The place whose population should be used for getting the brands
   * @return {Promise}
   */
  GetBrands(place) {
    return Bridge.restfulRequest('prodcat:GetBrands', 'SERV:prodcat:', {
      place,
    });
  },
  /**
   * @function GetProductsByBrand
   *
   * @param {string} [place] The place whose population should be used for getting the products
   * @param {string} brand
   * @param {boolean} [hubrequired] True/False value of hubrequired to further filter list by, if client&#x27;s do not provide a value this will default to NULL which will cause it to return products under specified brand name
   * @return {Promise}
   */
  GetProductsByBrand(place, brand, hubrequired) {
    return Bridge.restfulRequest('prodcat:GetProductsByBrand', 'SERV:prodcat:', {
      place,
      brand,
      hubrequired,
    });
  },
  /**
   * @function GetProductsByCategory
   *
   * @param {string} [place] The place whose population should be used for getting the products
   * @param {string} category
   * @return {Promise}
   */
  GetProductsByCategory(place, category) {
    return Bridge.restfulRequest('prodcat:GetProductsByCategory', 'SERV:prodcat:', {
      place,
      category,
    });
  },
  /**
   * @function GetProducts
   *
   * @param {string} [place] The place whose population should be used for getting the products
   * @param {enum} [include] Type of product catalog entries to include, defaults to BROWSEABLE.
   * @param {boolean} [hubRequired] True/False value of hubrequired to further filter list by, if client&#x27;s do not provide a value this will default to NULL which will cause it to return either the default BROWSEABLE or ALL products
   * @return {Promise}
   */
  GetProducts(place, include, hubRequired) {
    return Bridge.restfulRequest('prodcat:GetProducts', 'SERV:prodcat:', {
      place,
      include,
      hubRequired,
    });
  },
  /**
   * @function FindProducts
   *
   * @param {string} [place] The place whose population should be used for finding the products
   * @param {string} search
   * @return {Promise}
   */
  FindProducts(place, search) {
    return Bridge.restfulRequest('prodcat:FindProducts', 'SERV:prodcat:', {
      place,
      search,
    });
  },
  /**
   * @function GetProduct
   *
   * @param {string} [place] The place whose population should be used for getting the product
   * @param {string} id
   * @return {Promise}
   */
  GetProduct(place, id) {
    return Bridge.restfulRequest('prodcat:GetProduct', 'SERV:prodcat:', {
      place,
      id,
    });
  },
};
