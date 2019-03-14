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
 * @module {Object} i2web/models/ProMonitoringSettings ProMonitoringSettings
 * @parent app.models.capabilities
 *
 * Configuration for professional monitoring at a given place.
 */
export default {
  writeableAttributes: [
    /**
     * @property {boolean} promon\:notifyWhenAvailable
     *
     * The user should be notified when the service becomes available in their area.
     *
     */
    'promon:notifyWhenAvailable',
    /**
     * @property {string} promon\:permitNumber
     *
     * The permit number.
     *
     */
    'promon:permitNumber',
    /**
     * @property {int} promon\:adults
     *
     * The number of adults that live in the residence.
     *
     */
    'promon:adults',
    /**
     * @property {int} promon\:children
     *
     * The number of children that live in the residence.
     *
     */
    'promon:children',
    /**
     * @property {int} promon\:pets
     *
     * The number of pets that live in the residence.
     *
     */
    'promon:pets',
    /**
     * @property {string} promon\:directions
     *
     * Additional directions on how to get to the house.
     *
     */
    'promon:directions',
    /**
     * @property {string} promon\:gateCode
     *
     * The code to get onto the property, if applicable.
     *
     */
    'promon:gateCode',
    /**
     * @property {string} promon\:instructions
     *
     * Additional instructions for emergency dispatchers.
     *
     */
    'promon:instructions',
  ],
  methods: {
    /**
     * @function CheckAvailability
     *
     * Checks if the current place supports professional monitoring or not.
     *
     * @return {Promise}
     */
    CheckAvailability() {
      return Bridge.request('promon:CheckAvailability', this.GetDestination(), {});
    },
    /**
     * @function JoinTrial
     *
     * Allows the user to join the trial group by submitting a trial code.
     *
     * @param {string} code
     * @return {Promise}
     */
    JoinTrial(code) {
      return Bridge.request('promon:JoinTrial', this.GetDestination(), {
        code,
      });
    },
    /**
     * @function ValidateAddress
     *
     * Validates that the place&#x27;s address is recognized by the professional monitoring system. Usually when the address is invalid a set of suggestions may be used to prompt the user with alternatives.
     *
     * @param {StreetAddress} [streetAddress] If specified this address will be validated instead of the default place address.
     * @return {Promise}
     */
    ValidateAddress(streetAddress) {
      return Bridge.request('promon:ValidateAddress', this.GetDestination(), {
        streetAddress,
      });
    },
    /**
     * @function UpdateAddress
     *
     * Validate the address with UCC, and updates the  current place&#x27;s address if it is changed.  The address is optional and if not specified will use the address of the current place.
     *
     * @param {StreetAddress} [streetAddress] If specified the place address will be updated to use this given address.
     * @param {boolean} residential Whether or not this is a residential address.  Currently will always return an error if set to false.
     * @return {Promise}
     */
    UpdateAddress(streetAddress, residential) {
      return Bridge.request('promon:UpdateAddress', this.GetDestination(), {
        streetAddress,
        residential,
      });
    },
    /**
     * @function ListDepartments
     *
     * Lists the departments which service a place, generally used to figure out where to get a permit from.
     *
     * @return {Promise}
     */
    ListDepartments() {
      return Bridge.request('promon:ListDepartments', this.GetDestination(), {});
    },
    /**
     * @function CheckSensors
     *
     * Gets the set of professionally monitored devices which are currently offline.
     *
     * @return {Promise}
     */
    CheckSensors() {
      return Bridge.request('promon:CheckSensors', this.GetDestination(), {});
    },
    /**
     * @function Activate
     *
     * This enrolls and activates professional monitoring at the given place.  Billing will be updated and the place will be professionally monitored.
Note that if testCall is set to true this may return successfully, and then fail later if the test call fails.
     *
     * @param {boolean} [testCall] (Default: false) Set to true to invoke a test call and activate upon success.  Set to false / unspecified to activate without sending a test call.
     * @param {enum} [serviceLevel] The new Promon level for the specified place.
     * @return {Promise}
     */
    Activate(testCall, serviceLevel) {
      return Bridge.request('promon:Activate', this.GetDestination(), {
        testCall,
        serviceLevel,
      });
    },
    /**
     * @function TestCall
     *
     * This instructs the monitoring service to place a call to the number associated with the place.  This call will return immediately, but the lastCallStatus should be watched to determine when the test call is completed.
Note that if a test call is already in progress this will return the existing testCallTime, and as such may be retried safely.
     *
     * @return {Promise}
     */
    TestCall() {
      return Bridge.request('promon:TestCall', this.GetDestination(), {});
    },
    /**
     * @function Reset
     *
     * Downgrades the account to premium, deactivates the place and clears all promonitoring settings
     *
     * @return {Promise}
     */
    Reset() {
      return Bridge.request('promon:Reset', this.GetDestination(), {});
    },
  },
  events: {},
  ADDRESSVERIFICATION_UNVERIFIED: 'UNVERIFIED',
  ADDRESSVERIFICATION_RESIDENTIAL: 'RESIDENTIAL',
  TESTCALLSTATUS_IDLE: 'IDLE',
  TESTCALLSTATUS_WAITING: 'WAITING',
  TESTCALLSTATUS_SUCCEEDED: 'SUCCEEDED',
  TESTCALLSTATUS_FAILED: 'FAILED',
};
