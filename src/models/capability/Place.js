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
 * @module {Object} i2web/models/Place Place
 * @parent app.models.capabilities
 *
 * Model of a place
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} place\:name
     *
     * The name of the place
     *
     */
    'place:name',
    /**
     * @property {string} place\:state
     *
     * The state of the place
     *
     */
    'place:state',
    /**
     * @property {string} place\:streetAddress1
     *
     * First part of the street address
     *
     */
    'place:streetAddress1',
    /**
     * @property {string} place\:streetAddress2
     *
     * Second part of the street address
     *
     */
    'place:streetAddress2',
    /**
     * @property {string} place\:city
     *
     * The city
     *
     */
    'place:city',
    /**
     * @property {string} place\:stateProv
     *
     * The state or province
     *
     */
    'place:stateProv',
    /**
     * @property {string} place\:zipCode
     *
     * The zip code
     *
     */
    'place:zipCode',
    /**
     * @property {string} place\:zipPlus4
     *
     * Extended zip +4 digits
     *
     */
    'place:zipPlus4',
    /**
     * @property {string} place\:tzId
     *
     * System assigned timezone identifier
     *
     */
    'place:tzId',
    /**
     * @property {string} place\:tzName
     *
     * Timezone as Alaska, Atlantic, Central, Eastern, Hawaii, Mountain, None, Pacific, Samoa, UTC+10, UTC+11, UTC+12, UTC+9, valid only for US addresses
     *
     */
    'place:tzName',
    /**
     * @property {double} place\:tzOffset
     *
     * Timezone hour offset from UTC [-9, -4, -6, -5, -10, -7, 0, -8, -11, 10, 11, 12, 9], valid only for US addresses
     *
     */
    'place:tzOffset',
    /**
     * @property {boolean} place\:tzUsesDST
     *
     * True if timezone uses daylight savings time, false otherwise
     *
     */
    'place:tzUsesDST',
    /**
     * @property {string} place\:country
     *
     * The country
     *
     */
    'place:country',
    /**
     * @property {boolean} place\:addrValidated
     *
     * True if address is US address and passed USPS address validation
     *
     */
    'place:addrValidated',
    /**
     * @property {string} place\:addrType
     *
     * Address type according to address validation service [F&#x3D;firm (best), G&#x3D;general (held at local post office), H&#x3D;high-rise (contains apartment no.), P&#x3D;PO box, R&#x3D;rural route, S&#x3D;street (addr only matched to valid range of house numbers on street), blank (invalid)]
     *
     */
    'place:addrType',
    /**
     * @property {string} place\:addrZipType
     *
     * Zip code type [Unique, Military, POBox, Standard]
     *
     */
    'place:addrZipType',
    /**
     * @property {double} place\:addrLatitude
     *
     * Approximate latitude of address (averaged over zipcode)
     *
     */
    'place:addrLatitude',
    /**
     * @property {double} place\:addrLongitude
     *
     * Approximate longitude of address (averaged over zipcode)
     *
     */
    'place:addrLongitude',
    /**
     * @property {string} place\:addrGeoPrecision
     *
     * Precision of address lat,long [Unknown, None, Zip5, Zip6, Zip7, Zip8, Zip9]
     *
     */
    'place:addrGeoPrecision',
    /**
     * @property {string} place\:addrRDI
     *
     * USPS Residential Delivery Indicatory for address [Residential, Commercial, Unknown]
     *
     */
    'place:addrRDI',
    /**
     * @property {string} place\:addrCounty
     *
     * County name
     *
     */
    'place:addrCounty',
    /**
     * @property {string} place\:addrCountyFIPS
     *
     * 5 digit FIPS code as 2 digit FIPS and 3 digit county code
     *
     */
    'place:addrCountyFIPS',
  ],
  methods: {
    /**
     * @function ListDevices
     *
     * Lists all devices associated with this place
     *
     * @return {Promise}
     */
    ListDevices() {
      return Bridge.request('place:ListDevices', this.GetDestination(), {});
    },
    /**
     * @function GetHub
     *
     * Retrieves the object representing the hub at this place or null if the place has no hub
     *
     * @return {Promise}
     */
    GetHub() {
      return Bridge.request('place:GetHub', this.GetDestination(), {});
    },
    /**
     * @function StartAddingDevices
     *
     * Prepares this location to have devices added (paired) any devices added during this time will emit the device added event
     *
     * @param {long} time The amount of time in milliseconds for which the place will be able to add devices
     * @return {Promise}
     */
    StartAddingDevices(time) {
      return Bridge.request('place:StartAddingDevices', this.GetDestination(), {
        time,
      });
    },
    /**
     * @function StopAddingDevices
     *
     * Cleans up anything enabled into the home for having devices added (paired)
     *
     * @return {Promise}
     */
    StopAddingDevices() {
      return Bridge.request('place:StopAddingDevices', this.GetDestination(), {});
    },
    /**
     * @function RegisterHub
     *
     * Registered a hub at this place.  At some point later the HubAddedEvent will be posted
     *
     * @param {string} hubId The hub ID in the format AAA-NNNN
     * @return {Promise}
     */
    RegisterHub(hubId) {
      return Bridge.request('place:RegisterHub', this.GetDestination(), {
        hubId,
      });
    },
    /**
     * @function AddPerson
     *
     * Add a new person with permissions to this place.
     *
     * @param {Person} person The person you would like to create with person to this place.
     * @param {string} [password] The login password for this person.
     * @return {Promise}
     */
    AddPerson(person, password) {
      return Bridge.request('place:AddPerson', this.GetDestination(), {
        person,
        password,
      });
    },
    /**
     * @function ListPersons
     *
     * The list of persons who have access to this place.
     *
     * @return {Promise}
     */
    ListPersons() {
      return Bridge.request('place:ListPersons', this.GetDestination(), {});
    },
    /**
     * @function ListPersonsWithAccess
     *
     * The list of persons who have access to this place plus their role
     *
     * @return {Promise}
     */
    ListPersonsWithAccess() {
      return Bridge.request('place:ListPersonsWithAccess', this.GetDestination(), {});
    },
    /**
     * @function ListDashboardEntries
     *
     * Returns a list of the high-importance history log entries associated with this place
     *
     * @param {int} [limit] The maximum number of events to return (defaults to 10)
     * @param {string} [token] The token from a previous query to use for retrieving the next set of results
     * @return {Promise}
     */
    ListDashboardEntries(limit, token) {
      return Bridge.request('place:ListDashboardEntries', this.GetDestination(), {
        limit,
        token,
      });
    },
    /**
     * @function ListHistoryEntries
     *
     * Returns a list of all the history log entries associated with this place
     *
     * @param {int} [limit] The maximum number of events to return (defaults to 10)
     * @param {string} [token] The token from a previous query to use for retrieving the next set of results
     * @return {Promise}
     */
    ListHistoryEntries(limit, token) {
      return Bridge.request('place:ListHistoryEntries', this.GetDestination(), {
        limit,
        token,
      });
    },
    /**
     * @function Delete
     *
     * Remove the place and any associated entities.
     *
     * @return {Promise}
     */
    Delete() {
      return Bridge.request('place:Delete', this.GetDestination(), {});
    },
    /**
     * @function CreateInvitation
     *
     * Creates an invitation for the user
     *
     * @param {string} firstName The first name of the invitee
     * @param {string} lastName The last name of the invitee
     * @param {string} email The email address where the invitee can be reached
     * @param {string} [relationship] The relationship of the invitee to the invitor.  If not provided, defaults to other
     * @return {Promise}
     */
    CreateInvitation(firstName, lastName, email, relationship) {
      return Bridge.request('place:CreateInvitation', this.GetDestination(), {
        firstName,
        lastName,
        email,
        relationship,
      });
    },
    /**
     * @function SendInvitation
     *
     * Sends the given invitation
     *
     * @param {Invitation} invitation The invitation
     * @return {Promise}
     */
    SendInvitation(invitation) {
      return Bridge.request('place:SendInvitation', this.GetDestination(), {
        invitation,
      });
    },
    /**
     * @function PendingInvitations
     *
     * Lists all pending invitations for the place
     *
     * @return {Promise}
     */
    PendingInvitations() {
      return Bridge.request('place:PendingInvitations', this.GetDestination(), {});
    },
    /**
     * @function CancelInvitation
     *
     * Cancels and deletes an invitation
     *
     * @param {string} code The code to cancel
     * @return {Promise}
     */
    CancelInvitation(code) {
      return Bridge.request('place:CancelInvitation', this.GetDestination(), {
        code,
      });
    },
    /**
     * @function UpdateAddress
     *
     * Updates the current place&#x27;s address if it is changed and potentially other third-party systems.  The address is optional and if not specified will use the address of the current place.
     *
     * @param {StreetAddress} [streetAddress] If specified the place address will be updated to use this given address.
     * @return {Promise}
     */
    UpdateAddress(streetAddress) {
      return Bridge.request('place:UpdateAddress', this.GetDestination(), {
        streetAddress,
      });
    },
    /**
     * @function RegisterHubV2
     *
     * This attempts to register the addressed place with the given hub.  This call will not succeed until the hub is (1) online and (2) above the minimum firmware version.  At that point the call is idempotent, so may be safely retried.
     *
     * @param {string} hubId The ID of the hub to pair
     * @return {Promise}
     */
    RegisterHubV2(hubId) {
      return Bridge.request('place:RegisterHubV2', this.GetDestination(), {
        hubId,
      });
    },
  },
  events: {},
  SERVICELEVEL_BASIC: 'BASIC',
  SERVICELEVEL_PREMIUM: 'PREMIUM',
  SERVICELEVEL_PREMIUM_FREE: 'PREMIUM_FREE',
  SERVICELEVEL_PREMIUM_PROMON: 'PREMIUM_PROMON',
  SERVICELEVEL_PREMIUM_PROMON_FREE: 'PREMIUM_PROMON_FREE',
  SERVICELEVEL_PREMIUM_PROMON_MYPARTNER_DISCOUNT: 'PREMIUM_PROMON_MYPARTNER_DISCOUNT',
  SERVICELEVEL_PREMIUM_ANNUAL: 'PREMIUM_ANNUAL',
  SERVICELEVEL_PREMIUM_PROMON_ANNUAL: 'PREMIUM_PROMON_ANNUAL',
  // Manually added property, please make sure this is restored!
  SERVICEADDON_CELLBACKUP: 'CELLBACKUP',
};
