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
 * @module {Object} i2web/models/RuleService RuleService
 * @parent app.models.services
 *
 * Entry points for the rule service, which covers global operations such as listing rules or rule templates for places.
 */
export default {
  /**
   * @function ListRuleTemplates
   *
   * Lists all rule templates available for a given place
   *
   * @param {string} placeId UUID of the place
   * @return {Promise}
   */
  ListRuleTemplates(placeId) {
    return Bridge.request('rule:ListRuleTemplates', 'SERV:rule:', {
      placeId,
    });
  },
  /**
   * @function ListRules
   *
   * Lists all rules defined for a given place
   *
   * @param {string} placeId UUID of the place
   * @return {Promise}
   */
  ListRules(placeId) {
    return Bridge.request('rule:ListRules', 'SERV:rule:', {
      placeId,
    });
  },
  /**
   * @function GetCategories
   *
   * Returns a map containing the names of the categories and counts of available rules
   *
   * @param {string} placeId UUID of the place
   * @return {Promise}
   */
  GetCategories(placeId) {
    return Bridge.request('rule:GetCategories', 'SERV:rule:', {
      placeId,
    });
  },
  /**
   * @function GetRuleTemplatesByCategory
   *
   * @param {string} placeId UUID of the place
   * @param {string} category The category name
   * @return {Promise}
   */
  GetRuleTemplatesByCategory(placeId, category) {
    return Bridge.request('rule:GetRuleTemplatesByCategory', 'SERV:rule:', {
      placeId,
      category,
    });
  },
};
