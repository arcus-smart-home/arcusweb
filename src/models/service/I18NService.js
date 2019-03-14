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
 * @module {Object} i2web/models/I18NService I18NService
 * @parent app.models.services
 *
 * Entry points for the i18n service, which is used to fetch localized keys.
 */
export default {
  /**
   * @function LoadLocalizedStrings
   *
   * Loads localized keys from the server
   *
   * @param {set<string>} [bundleNames] The set of bundles to load, if null or empty all bundles will be loaded
   * @param {string} [locale] The locale to load the localized strings, if not provided or is empty en-US will be used
   * @return {Promise}
   */
  LoadLocalizedStrings(bundleNames, locale) {
    return Bridge.restfulRequest('i18n:LoadLocalizedStrings', 'SERV:i18n:', {
      bundleNames,
      locale,
    });
  },
};
