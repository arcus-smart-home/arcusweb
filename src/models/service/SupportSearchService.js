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
 * @module {Object} i2web/models/SupportSearchService SupportSearchService
 * @parent app.models.services
 *
 * Support Search Service
 */
export default {
  /**
   * @function SupportMainSearch
   *
   * Searches the Elastic Search full text search index
   *
   * @param {string} critera The string to use for searching
   * @param {integer} from starting point for results to return
   * @param {integer} size total result size to return
   * @return {Promise}
   */
  SupportMainSearch(critera, from, size) {
    return Bridge.request('supportsearch:SupportMainSearch', 'SERV:supportsearch:', {
      critera,
      from,
      size,
    });
  },
};
