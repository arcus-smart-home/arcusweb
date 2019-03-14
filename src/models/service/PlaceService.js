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
 * @module {Object} i2web/models/PlaceService PlaceService
 * @parent app.models.services
 *
 * Static services related to places.
 */
export default {
  /**
   * @function ListTimezones
   *
   * Creates an initial account, which includes the billing account, account owning person, default place, login credentials and default authorization grants
   *
   * @return {Promise}
   */
  ListTimezones() {
    return Bridge.restfulRequest('place:ListTimezones', 'SERV:place:', {});
  },
  /**
   * @function ValidateAddress
   *
   * Validates the place&#x27;s address. Usually when the address is invalid a set of suggestions may be used to prompt the user with alternatives.
   *
   * @param {string} [placeId] Optional identifier or the place to validate
   * @param {StreetAddress} streetAddress If specified this address will be validated instead of the default place address.
   * @return {Promise}
   */
  ValidateAddress(placeId, streetAddress) {
    return Bridge.request('place:ValidateAddress', 'SERV:place:', {
      placeId,
      streetAddress,
    });
  },
};
