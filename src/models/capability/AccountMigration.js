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
 * @module {Object} i2web/models/AccountMigration AccountMigration
 * @parent app.models.capabilities
 *
 * Add additional methods necessary to migration an account from V1 to V2
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function MigrateBillingAccount
     *
     * Creates a new V2 billing account for the user based on their V1 service level
     *
     * @param {string} billingToken Billing token recevied from ReCurly
     * @param {string} placeID Place ID to associate the initial subscription to
     * @param {enum} serviceLevel The current v1 service level translated into the V2 enumeration
     * @return {Promise}
     */
    MigrateBillingAccount(billingToken, placeID, serviceLevel) {
      return Bridge.request('accountmig:MigrateBillingAccount', this.GetDestination(), {
        billingToken,
        placeID,
        serviceLevel,
      });
    },
  },
  events: {},

};
