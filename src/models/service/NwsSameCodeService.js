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
 * @module {Object} i2web/models/NwsSameCodeService NwsSameCodeService
 * @parent app.models.services
 *
 * Service methods for retrieving SAME Codes from the NWS SAME Code database.
 */
export default {
  /**
   * @function ListSameCounties
   *
   * @param {string} stateCode 2 or 3 char state or territory postal code from the NWS SAME Code database
   * @return {Promise}
   */
  ListSameCounties(stateCode) {
    return Bridge.restfulRequest('nwssamecode:ListSameCounties', 'SERV:nwssamecode:', {
      stateCode,
    });
  },
  /**
   * @function ListSameStates
   *
   * @return {Promise}
   */
  ListSameStates() {
    return Bridge.restfulRequest('nwssamecode:ListSameStates', 'SERV:nwssamecode:', {});
  },
  /**
   * @function GetSameCode
   *
   * @param {string} stateCode 2 or 3 char state or territory postal code from the NWS SAME Code database
   * @param {string} county county name specific to weather station as listed in the NWS SAME Code database
   * @return {Promise}
   */
  GetSameCode(stateCode, county) {
    return Bridge.restfulRequest('nwssamecode:GetSameCode', 'SERV:nwssamecode:', {
      stateCode,
      county,
    });
  },
};
