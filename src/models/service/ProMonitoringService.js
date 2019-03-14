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
 * @module {Object} i2web/models/ProMonitoringService ProMonitoringService
 * @parent app.models.services
 *
 * Access to the professional monitoring settings for a place.
 */
export default {
  /**
   * @function GetSettings
   *
   * Gets the promonitoring settings for the specified place.
   *
   * @param {string} place The place address to load the settings for
   * @return {Promise}
   */
  GetSettings(place) {
    return Bridge.request('promon:GetSettings', 'SERV:promon:', {
      place,
    });
  },
  /**
   * @function GetMetaData
   *
   * Gets the promonitoring metadata that represents caller id data for each area as a list of phone numbers
   *
   * @return {Promise}
   */
  GetMetaData() {
    return Bridge.request('promon:GetMetaData', 'SERV:promon:', {});
  },
  /**
   * @function CheckAvailability
   *
   * Check promonitoring availability for the given zipcode and state
   *
   * @param {string} zipcode 5 digits US postal codes
   * @param {string} state The US postal service 2 character state code (such as KS, CA, NY).
   * @return {Promise}
   */
  CheckAvailability(zipcode, state) {
    return Bridge.restfulRequest('promon:CheckAvailability', 'SERV:promon:', {
      zipcode,
      state,
    });
  },
};
