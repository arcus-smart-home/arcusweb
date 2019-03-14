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

import 'can-map-define';
import 'can-construct-super';
import BILLING_STATES from 'config/state-options';
import { FormComponent, FormEvents, FormViewModel } from 'i2web/components/form/';
import view from './billing.stache';
import Account from 'i2web/models/account';
import Place from 'i2web/models/place';
import getAppState from 'i2web/plugins/get-app-state';
import moment from 'moment';
import each from 'can-util/js/each/';

const RECURLY_TO_VM_MAP = {
  first_name: 'formAccount.account:billingFirstName',
  last_name: 'formAccount.account:billingLastName',
  number: 'cardNumber',
  verification_value: 'cvv',
  month: 'month',
  year: 'year',
  address1: 'formAccount.account:billingStreet1',
  address2: 'formAccount.account:billingStreet2',
  city: 'formAccount.account:billingCity',
  state: 'formAccount.account:billingState',
  postal_code: 'formAccount.account:billingZip',
};

/**
 * @module {canMap} i2web/components/form/billing Billing
 * @parent i2web/components/form
 * @description Reset Password form
 */
export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/form/billing
     *
     * @description Form validation constraints
     */
    constraints: {
      value: {
        'formAccount.account:billingFirstName': {
          presence: true,
        },
        'formAccount.account:billingLastName': {
          presence: true,
        },
        cardNumber: {
          presence: true,
          cardNumber: true,
        },
        cvv: {
          presence: true,
          numericality: {
            onlyInteger: true,
          },
          length: {
            minimum: 3,
            maximum: 4,
            message: 'must be 3 or 4 digits',
          },
        },
        month: {
          presence: true,
        },
        year: {
          presence: true,
        },
        'formAccount.account:billingStreet1': {
          presence: true,
        },
        'formAccount.account:billingCity': {
          presence: true,
        },
        'formAccount.account:billingState': {
          presence: true,
        },
        'formAccount.account:billingZip': {
          presence: true,
        },
      },
    },
    /**
     * @property {Account} account
     * @parent i2web/components/form/billing
     */
    account: {
      Type: Account,
      set(account) {
        if (account) {
          this.attr('formAccount', account.clone());
        }
        return account;
      },
    },
    /**
     * @property {Array} billingStates
     * @parent i2web/components/form/billing
     */
    billingStates: {
      value: BILLING_STATES,
    },
    /**
     * @property {Account} formAccount
     * @parent i2web/components/form/billing
     */
    formAccount: {
      Type: Account,
      get(lastSetValue) {
        if (this.attr('sameAsHome') && this.attr('place')) {
          const place = this.attr('place');
          lastSetValue.attr({
            'account:billingStreet1': place.attr('place:streetAddress1'),
            'account:billingStreet2': place.attr('place:streetAddress2'),
            'account:billingCity': place.attr('place:city'),
            'account:billingState': place.attr('place:state'),
            'account:billingZip': place.attr('place:zipCode'),
          });
          return lastSetValue;
        }
        const account = this.attr('account');
        lastSetValue.attr({
          'account:billingStreet1': account.attr('account:billingStreet1'),
          'account:billingStreet2': account.attr('account:billingStreet2'),
          'account:billingCity': account.attr('account:billingCity'),
          'account:billingState': account.attr('account:billingState'),
          'account:billingZip': account.attr('account:billingZip'),
        });
        return lastSetValue;
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/form/billing
     */
    place: {
      Type: Place,
    },
    /**
    * @property {string} cardNumber
    * @parent i2web/components/form/billing
    *
    * Billing Card Number
    */
    cardNumber: {
      type: 'string',
    },
    /**
    * @property {string} previousCardFieldLabel
    * @parent i2web/components/form/billing
    *
    * Field label for the new credit card number, includes last four digits
    * of the previously submitted card, if available.
    */
    previousCardFieldLabel: {
      get() {
        const mask = String.fromCharCode(0x25CF);
        const last4 = this.attr('formAccount.account:billingCCLast4');
        return `Card Number${last4 ? ` (${mask}${last4})` : ''}`;
      },
    },
    /**
    * @property {string} cvv
    * @parent i2web/components/form/billing
    *
    * CVV/Security Number
    */
    cvv: {
      type: 'string',
    },
    /**
    * @property {string} month
    * @parent i2web/components/form/billing
    *
    * Billing Month
    */
    month: {
      type: 'string',
    },
    /**
    * @property {string} year
    * @parent i2web/components/form/billing
    *
    * Billing Year
    */
    year: {
      type: 'string',
    },
    /**
    * @property {Array} expirationYearOptions
    * @parent i2web/components/form/billing
    *
    * Array of the current year plus the next ten years, used as the source for the expiration year
    */
    expirationYearOptions: {
      value() {
        const thisYear = moment().year();
        const years = [];
        for (let i = 0; i < 10; i++) {
          years.push(i + thisYear);
        }
        return years;
      },
    },
    /**
     * @property {String} initialError
     * @parent i2web/components/form/billing
     * @description Displays an initial error when the form is first display;
     * generally used by a parent component that needs to gather new billing info
     */
    initialError: {},
    /**
     * @property {function} onSave
     * @parent i2web/components/form/billing
     * @description Accept an onSave method as an optional parameter for the component;
     * if specified, invoke this method after the billing info is successfully saved;
     * generally used by the parent component to keep the Side Panel open.
     */
    onSave: {},
    /**
     * @property {Boolean} sameAsHome
     * @parent i2web/components/form/billing
     * @description Indicates the state of the Same As Home Address checkbox
     */
    sameAsHome: {
      type: 'boolean',
      value: false,
    },
  },
  /**
  * @property {Boolean} saving
  * @parent i2web/components/form/billing
  * whether the form is being saved
  */
  saving: false,
  /**
  * @function save
  * @parent i2web/components/form/billing
  *
  * @param vm
  * @param el
  * @param ev
  */
  save(vm, el, ev) {
    ev.preventDefault();

    if (!this.hasChanges()) {
      ev.stopPropagation();
      return;
    }

    if (this.formValidates()) {
      this.closePanel();
    } else {
      this.attr('saving', false);
      const message = 'There was an error saving your billing information. Please try again later.';
      this.attr('formError', message);
    }
  },
  init() {
    this._super(arguments);
  },
});

const BillingFormEvents = Object.assign({
  inserted() {
    if (this.viewModel.attr('initialError')) {
      this.viewModel.attr('formError', this.viewModel.attr('initialError'));
    }
  },
}, FormEvents);

export default FormComponent.extend({
  tag: 'arcus-form-billing',
  viewModel: ViewModel,
  view,
  events: BillingFormEvents,
});
