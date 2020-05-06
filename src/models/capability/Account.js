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
 * @module {Object} i2web/models/Account Account
 * @parent app.models.capabilities
 *
 * Model of an account
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} account\:state
     *
     * Platform-owned state of the account
     *
     */
    'account:state',
  ],
  methods: {
    /**
     * @function ListDevices
     *
     * Lists all devices associated with this account
     *
     * @return {Promise}
     */
    ListDevices() {
      return Bridge.request('account:ListDevices', this.GetDestination(), {});
    },
    /**
     * @function ListHubs
     *
     * Lists all hubs associated with this account
     *
     * @return {Promise}
     */
    ListHubs() {
      return Bridge.request('account:ListHubs', this.GetDestination(), {});
    },
    /**
     * @function ListPlaces
     *
     * Lists all the places associated with this account
     *
     * @return {Promise}
     */
    ListPlaces() {
      return Bridge.request('account:ListPlaces', this.GetDestination(), {});
    },
    /**
     * @function ListInvoices
     *
     * Lists all Recurly invoices associated with this account
     *
     * @return {Promise}
     */
    ListInvoices() {
      return Bridge.request('account:ListInvoices', this.GetDestination(), {});
    },
    /**
     * @function ListAdjustments
     *
     * Lists all adjustments associated with this account
     *
     * @return {Promise}
     */
    ListAdjustments() {
      return Bridge.request('account:ListAdjustments', this.GetDestination(), {});
    },
    /**
     * @function SignupTransition
     *
     * Send a state transition to indicate where in the sign-up process the account is
     *
     * @param {string} stepcompleted The last step the account has completed during the signup process
     * @return {Promise}
     */
    SignupTransition(stepcompleted) {
      return Bridge.request('account:SignupTransition', this.GetDestination(), {
        stepcompleted,
      });
    },
    /**
     * @function UpdateBillingInfoCC
     *
     * Updates billing info that contains Credit Card information using a token from ReCurly.
     *
     * @param {string} billingToken Billing token recevied from ReCurly
     * @return {Promise}
     */
    UpdateBillingInfoCC(billingToken) {
      return Bridge.request('account:UpdateBillingInfoCC', this.GetDestination(), {
        billingToken,
      });
    },
    /**
     * @function SkipPremiumTrial
     *
     * Method invoked to inform the platform that the user has explicitly decided to skip the premium trial.
     *
     * @return {Promise}
     */
    SkipPremiumTrial() {
      return Bridge.request('account:SkipPremiumTrial', this.GetDestination(), {});
    },
    /**
     * @function CreateBillingAccount
     *
     * Create a users billing account and sets up the initial subscription
     *
     * @param {string} billingToken Billing token recevied from ReCurly
     * @param {string} placeID Place ID to associate the initial subscription to
     * @return {Promise}
     */
    CreateBillingAccount(billingToken, placeID) {
      return Bridge.request('account:CreateBillingAccount', this.GetDestination(), {
        billingToken,
        placeID,
      });
    },
    /**
     * @function UpdateServicePlan
     *
     * Updates the subscription level and addons for the specified place ID.
     *
     * @param {uuid} placeID Place ID to associate the new service plan info with.
     * @param {enum} serviceLevel The new service level for the specified place.
     * @param {object} addons Map of addons to booleans indicating if the addon is active for the specified place.
     * @return {Promise}
     */
    UpdateServicePlan(placeID, serviceLevel, addons) {
      return Bridge.request('account:UpdateServicePlan', this.GetDestination(), {
        placeID,
        serviceLevel,
        addons,
      });
    },
    /**
     * @function AddPlace
     *
     * Adds a place for this account
     *
     * @param {Place} place Instance of the writable place model attributes represented as a map
     * @param {uuid} [population] Deprecated - population will always be assigned as general for the new place.
     * @param {enum} serviceLevel The service level the new place will be at.
     * @param {object} [addons] Map of addons to booleans indicating if the addon will be actived for the new place.
     * @return {Promise}
     */
    AddPlace(place, population, serviceLevel, addons) {
      return Bridge.request('account:AddPlace', this.GetDestination(), {
        place,
        population,
        serviceLevel,
        addons,
      });
    },
    /**
     * @function Delete
     *
     * Deletes an account with optional removal of the login
     *
     * @param {boolean} [deleteOwnerLogin] When set to true will also remove the login for the owner of the account, false will leave it.  If not specified, defaults to false
     * @return {Promise}
     */
    Delete(deleteOwnerLogin) {
      return Bridge.request('account:Delete', this.GetDestination(), {
        deleteOwnerLogin,
      });
    },
    /**
     * @function DelinquentAccountEvent
     *
     * An account has be marked Delinquent
     *
     * @param {string} accountId The account id for the deliquent invoice
     * @return {Promise}
     */
    DelinquentAccountEvent(accountId) {
      return Bridge.request('account:DelinquentAccountEvent', this.GetDestination(), {
        accountId,
      });
    },
    /**
     * @function IssueCredit
     *
     * Creates a credit adjustment using ReCurly.
     *
     * @param {string} amountInCents The amount to credit. Must be a negative amount of cents
     * @param {string} [description] The reason for the credit, or empty
     * @return {Promise}
     */
    IssueCredit(amountInCents, description) {
      return Bridge.request('account:IssueCredit', this.GetDestination(), {
        amountInCents,
        description,
      });
    },
    /**
     * @function IssueInvoiceRefund
     *
     * Creates a refund of an entire invoice using ReCurly.
     *
     * @param {string} invoiceNumber The invoice number to refund.
     * @return {Promise}
     */
    IssueInvoiceRefund(invoiceNumber) {
      return Bridge.request('account:IssueInvoiceRefund', this.GetDestination(), {
        invoiceNumber,
      });
    },
    /**
     * @function Activate
     *
     * Method invoked to signal that account signup is complete.
     *
     * @return {Promise}
     */
    Activate() {
      return Bridge.request('account:Activate', this.GetDestination(), {});
    },
    /**
     * @function ApplyPartnerDiscount
     *
     * Applies the Partner discount and associates this account with the specified Partner account. May be called again to update the linked myPartnerEmail, the resolved Partner account, or both.
     *
     * @param {string} myPartnerEmail The Partner email address of the account owner
     * @param {string} myPartnerPassword The Partner password of the account owner
     * @return {Promise}
     */
    ApplyPartnerDiscount(myPartnerEmail, myPartnerPassword) {
      return Bridge.restfulRequest('account:ApplyPartnerDiscount', this.GetDestination(), {
        myPartnerEmail,
        myPartnerPassword,
      });
    },
    /**
     * @function RemovePartnerDiscount
     *
     * Removes the Partner discount and disassociates this account from the specified Partner account
     *
     * @return {Promise}
     */
    RemovePartnerDiscount() {
      return Bridge.restfulRequest('account:RemovePartnerDiscount', this.GetDestination(), {});
    },
  },
  events: {},

};
