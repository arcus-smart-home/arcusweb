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

import Cornea from 'i2web/cornea/';

/**
 * @module {Object} i2web/models/Person Person
 * @parent app.models.capabilities
 *
 * Model of a person
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} person\:firstName
     *
     * First name of the person
     *
     */
    'person:firstName',
    /**
     * @property {string} person\:lastName
     *
     * Last name of the person
     *
     */
    'person:lastName',
    /**
     * @property {string} person\:email
     *
     * The email address for the person
     *
     */
    'person:email',
    /**
     * @property {string} person\:mobileNumber
     *
     * The mobile phone number for the person
     *
     */
    'person:mobileNumber',
    /**
     * @property {list<string>} person\:mobileNotificationEndpoints
     *
     * The list of mobile endpoints where notifications may be sent
     *
     */
    'person:mobileNotificationEndpoints',
    /**
     * @property {uuid} person\:currPlace
     *
     * The ID of the current place where the person is present
     *
     */
    'person:currPlace',
    /**
     * @property {string} person\:currPlaceMethod
     *
     * The methodology used for determining the current place
     *
     */
    'person:currPlaceMethod',
    /**
     * @property {string} person\:currLocation
     *
     * The current location of the person
     *
     */
    'person:currLocation',
    /**
     * @property {timestamp} person\:currLocationTime
     *
     * The time that the current location was determined
     *
     */
    'person:currLocationTime',
    /**
     * @property {string} person\:currLocationMethod
     *
     * The methodology used for determining the current location
     *
     */
    'person:currLocationMethod',
    /**
     * @property {timestamp} person\:consentOffersPromotions
     *
     * The date and time when this person provided consent to receive communications of offers and promotions
     *
     */
    'person:consentOffersPromotions',
    /**
     * @property {timestamp} person\:consentStatement
     *
     * The date and time where person provided consent to receive monthly statement communications
     *
     */
    'person:consentStatement',
  ],
  methods: {
    /**
     * @function SetSecurityAnswers
     *
     * Sets the security answers for the given person.  The first question and answer are required, those for the second and third are optional.
     *
     * @param {string} securityQuestion1 The identifier for the first question answered
     * @param {string} securityAnswer1 The user&#x27;s answer for the question identified in securityQuestion1
     * @param {string} [securityQuestion2] The identifier for the second question answered
     * @param {string} [securityAnswer2] The user&#x27;s answer for the question identified in securityQuestion2
     * @param {string} [securityQuestion3] The identifier for the third question answered
     * @param {string} [securityAnswer3] The user&#x27;s answer for the question identified in securityQuestion3
     * @return {Promise}
     */
    SetSecurityAnswers(securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2, securityQuestion3, securityAnswer3) {
      return Bridge.request('person:SetSecurityAnswers', this.GetDestination(), {
        securityQuestion1,
        securityAnswer1,
        securityQuestion2,
        securityAnswer2,
        securityQuestion3,
        securityAnswer3,
      });
    },
    /**
     * @function GetSecurityAnswers
     *
     * Retrieves the security responses for the given person
     *
     * @return {Promise}
     */
    GetSecurityAnswers() {
      return Bridge.request('person:GetSecurityAnswers', this.GetDestination(), {});
    },
    /**
     * @function AddMobileDevice
     *
     * Adds and associates a mobile device for the given person
     *
     * @param {string} [name] A user-assigned name for this mobile device; useful when specifying which devices will receive notifications.
     * @param {string} [appVersion] The version of the Arcus app running on the device.
     * @param {string} osType The type of operating system the mobile device is running (iOS, Android for example).
     * @param {string} [osVersion] The version of the operating system running on the mobile device.
     * @param {string} [formFactor] The form factor of the device (phone, tablet for example).
     * @param {string} [phoneNumber] The phone number of the device if present.
     * @param {string} [deviceIdentifier] Device specific unique identifier for the mobile device if possible.
     * @param {string} [deviceModel] The model of the device if known.
     * @param {string} [deviceVendor] The vendor of the device if known.
     * @param {string} [resolution] The screen resolution of the device (ex. xhdpi)
     * @param {string} [notificationToken] The token for sending push notifications to this device if it is registered to do so.
     * @param {double} [lastLatitude] The last measured latitude if collected.
     * @param {double} [lastLongitude] The last measured longitude if collected.
     * @return {Promise}
     */
    AddMobileDevice(name, appVersion, osType, osVersion, formFactor, phoneNumber, deviceIdentifier, deviceModel, deviceVendor, resolution, notificationToken, lastLatitude, lastLongitude) {
      return Bridge.request('person:AddMobileDevice', this.GetDestination(), {
        name,
        appVersion,
        osType,
        osVersion,
        formFactor,
        phoneNumber,
        deviceIdentifier,
        deviceModel,
        deviceVendor,
        resolution,
        notificationToken,
        lastLatitude,
        lastLongitude,
      });
    },
    /**
     * @function RemoveMobileDevice
     *
     * Removes/disassociates a mobile device from this person
     *
     * @param {int} deviceIndex Platform-owned index for the device that uniquely identifies it within the context of this person
     * @return {Promise}
     */
    RemoveMobileDevice(deviceIndex) {
      return Bridge.request('person:RemoveMobileDevice', this.GetDestination(), {
        deviceIndex,
      });
    },
    /**
     * @function ListMobileDevices
     *
     * Lists all mobile devices associated with this person
     *
     * @return {Promise}
     */
    ListMobileDevices() {
      return Bridge.request('person:ListMobileDevices', this.GetDestination(), {});
    },
    /**
     * @function ListHistoryEntries
     *
     * Returns a list of all the history log entries associated with this person
     *
     * @param {int} [limit] The maximum number of events to return (defaults to 10)
     * @param {string} [token] The token from a previous query to use for retrieving the next set of results
     * @return {Promise}
     */
    ListHistoryEntries(limit, token) {
      return Bridge.request('person:ListHistoryEntries', this.GetDestination(), {
        limit,
        token,
      });
    },
    /**
     * @function Delete
     *
     * Remove/Deactivate the person record indicated.
     *
     * @return {Promise}
     */
    Delete() {
      return Bridge.request('person:Delete', this.GetDestination(), {});
    },
    /**
     * @function RemoveFromPlace
     *
     * Removes a person from a specific place.  If the person is a hobbit they will be completely deleted.
     *
     * @param {string} [placeId] The place to remove the person from.  If not provided the place header (active place) from the message will be used.
     * @return {Promise}
     */
    RemoveFromPlace(placeId) {
      return Bridge.request('person:RemoveFromPlace', this.GetDestination(), {
        placeId,
      });
    },
    /**
     * @function ChangePin
     *
     * Changes the person&#x27;s pin at their currPlace.  Deprecated, use ChangePinV2 instead.
     *
     * @param {string} [currentPin] The current pin of the person if they have one.  If they have a pin this must match their existing pin
     * @param {string} newPin The new pin for the person
     * @return {Promise}
     */
    ChangePin(currentPin, newPin) {
      return Bridge.restfulRequest('person:ChangePin', this.GetDestination(), {
        currentPin,
        newPin,
      });
    },
    /**
     * @function ChangePinV2
     *
     * Changes the person&#x27;s pin at the specified place.  People are allowed to change their own pin or a hobbit at the specified place assuming the person invoking the call has access to the place.
     *
     * @param {string} place The identifier for the place where the person will use the pin
     * @param {string} pin The pin to set for the person
     * @return {Promise}
     */
    ChangePinV2(place, pin) {
      return Bridge.restfulRequest('person:ChangePinV2', this.GetDestination(), {
        place,
        pin,
      });
    },
    /**
     * @function VerifyPin
     *
     * Verifies that the pins match and that the requester is logged in as the person that the pin is being verified for.
     *
     * @param {string} place The identifier of the place with the pin for the person to compare against
     * @param {string} pin The pin to compare against
     * @return {Promise}
     */
    VerifyPin(place, pin) {
      return Bridge.restfulRequest('person:VerifyPin', this.GetDestination(), {
        place,
        pin,
      });
    },
    /**
     * @function AcceptInvitation
     *
     * Accepts an invitation
     *
     * @param {string} code The invitation code the person is accepting
     * @param {string} inviteeEmail The email the invitation was sent to
     * @return {Promise}
     */
    AcceptInvitation(code, inviteeEmail) {
      return Bridge.request('person:AcceptInvitation', this.GetDestination(), {
        code,
        inviteeEmail,
      });
    },
    /**
     * @function RejectInvitation
     *
     * Rejects an invitation
     *
     * @param {string} code The invitation code the person is rejecting
     * @param {string} inviteeEmail The email the invitation was sent to
     * @param {string} [reason] The reason the person is rejecting the code
     * @return {Promise}
     */
    RejectInvitation(code, inviteeEmail, reason) {
      return Bridge.request('person:RejectInvitation', this.GetDestination(), {
        code,
        inviteeEmail,
        reason,
      });
    },
    /**
     * @function PendingInvitations
     *
     * Retrieves the list of pending invitations for this user
     *
     * @return {Promise}
     */
    PendingInvitations() {
      return Bridge.request('person:PendingInvitations', this.GetDestination(), {});
    },
    /**
     * @function PromoteToAccount
     *
     * Promotes a user with a login to full fledged ARCUS account
     *
     * @param {Place} place The place information or the new account
     * @return {Promise}
     */
    PromoteToAccount(place) {
      return Bridge.request('person:PromoteToAccount', this.GetDestination(), {
        place,
      });
    },
    /**
     * @function DeleteLogin
     *
     * Deletes complete the login and any associations with it
     *
     * @return {Promise}
     */
    DeleteLogin() {
      return Bridge.request('person:DeleteLogin', this.GetDestination(), {});
    },
    /**
     * @function ListAvailablePlaces
     *
     * Lists the available places for a person.  Returns the same structure as the session service&#x27;s method
     *
     * @return {Promise}
     */
    ListAvailablePlaces() {
      return Bridge.request('person:ListAvailablePlaces', this.GetDestination(), {});
    },
    /**
     * @function AcceptPolicy
     *
     * Accept terms &amp; conditions and/or privacy policy
     *
     * @param {enum} type PRIVACY for privacy policy, TERMS for terms &amp; condition.  In order to accept both, need to call the method twice.
     * @return {Promise}
     */
    AcceptPolicy(type) {
      return Bridge.request('person:AcceptPolicy', this.GetDestination(), {
        type,
      });
    },
    /**
     * @function RejectPolicy
     *
     * Reject terms &amp; conditions and/or privacy policy. NOTE THIS IS GENERALLY FOR TESTING ONLY
     *
     * @param {enum} type PRIVACY for privacy policy, TERMS for terms &amp; condition.  In order to reject both, need to call the method twice.
     * @return {Promise}
     */
    RejectPolicy(type) {
      return Bridge.request('person:RejectPolicy', this.GetDestination(), {
        type,
      });
    },
    /**
     * @function SendVerificationEmail
     *
     * Generates an email address verification email.
     *
     * @param {enum} [source] The source where the email verification request comes from.  Default is WEB.
     * @return {Promise}
     */
    SendVerificationEmail(source) {
      return Bridge.restfulRequest('person:SendVerificationEmail', this.GetDestination(), {
        source,
      });
    },
    /**
     * @function VerifyEmail
     *
     * Verifies that the user has access to their current email address by providing the token from the email.
     *
     * @param {string} token The verification token.
     * @return {Promise}
     */
    VerifyEmail(token) {
      return Bridge.restfulRequest('person:VerifyEmail', this.GetDestination(), {
        token,
      });
    },
  },
  events: {
    /**
     * @function onPinChangedEvent
     *
     * Emitted when the the user changes their pin
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPinChangedEvent(callback) {
      Cornea.on('person person:PinChangedEvent', callback);
    },
    /**
     * @function onInvitationPending
     *
     * Emitted when an invitation has been sent to this user
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onInvitationPending(callback) {
      Cornea.on('person person:InvitationPending', callback);
    },
    /**
     * @function onInvitationCancelled
     *
     * Emitted when an invitation for this user has been cancelled
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onInvitationCancelled(callback) {
      Cornea.on('person person:InvitationCancelled', callback);
    },
    /**
     * @function onAuthorizationRemoved
     *
     * Emitted when authorization to a place is removed for this user.  This is an internal platform event that the client-bridge listens.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onAuthorizationRemoved(callback) {
      Cornea.on('person person:AuthorizationRemoved', callback);
    },
  },

};
