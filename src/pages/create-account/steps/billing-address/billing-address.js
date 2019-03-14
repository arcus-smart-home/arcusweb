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

import $ from 'jquery';
import _ from 'lodash';
import 'can-map-define';
import 'can-construct-super';
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import Account from 'i2web/models/account';
import PlaceCapability from 'i2web/models/capability/Place';
import view from './billing-address.stache';

const PREV_VALUES = {
  first_name: 'firstName',
  last_name: 'lastName',
  month: 'expMonth',
  number: 'cardNumber',
  verification_value: 'cvv',
  year: 'expYear',
};

/**
 * @module {canMap} i2web/pages/create-account/steps/billing-address Billing Address
 * @parent i2web/pages/create-account/steps/billing-address
 * @description Account Creation Billing Address step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:billing',
    },
    /**
     * @property {Account} account
     * @parent i2web/pages/create-account/steps/billing-address
     * @description The new account
     */
    account: {
      Type: Account,
      set(account) {
        this.attr('formAccount', account.clone());
        return account;
      },
    },
    /**
     * @property {Boolean} bypass
     * @parent 2web/pages/create-account/steps/billing-address
     * @description Only show this step when a billable plan is selected
     */
    bypass: {
      get() {
        const place = this.attr('place');
        if (place) {
          const placeTags = place.attr('base:tags').attr();
          return placeTags.includes(`PREF_PLAN:${PlaceCapability.SERVICELEVEL_BASIC}`)
            || (this.attr('completedStages').includes(this.attr('stageName'))
            && this.attr('hasCompleteState'));
        }
        return false;
      },
    },
    /**
     * @property {Array} completedStages
     * @parent i2web/pages/create-account/steps/billing-address
     * @description A collection of the completed stages
     */
    completedStages: {
      Type: Array,
    },
    /**
     * @property {Array} completedStages
     * @parent i2web/pages/create-account/steps/billing-address
     * @description A copy of the Account used for sensitive data collection
     */
    formAccount: {
      Type: Account,
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/billing-address
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        const account = this.attr('account');
        return account && this.attr('account').attr('account:billingCCLast4');
      },
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/create-account/steps/billing-address
     * @description The form defaults to the address the User has entered
     */
    isSatisfied: {
      type: 'boolean',
      value: true,
    },
  },
  /**
   * @function onActivate
   * @parent i2web/pages/create-account/steps/billing-address
   * @description called when the step is activated
   */
  onActivate() {
    this.attr('formError', null);
    const state = this.attr('place.place:state');
    if (state) {
      $('arcus-create-account-billing-address')
        .find('select')
        .dropdown('set selected', state);
    }
  },
  /**
   * @property {Promise} onNext
   * @parent i2web/pages/create-account/steps/billing-address
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((advance, stay) => {
      if (this.isValidForm()) {
        advance();
      } else {
        this.focusOnFirstError();
        stay();
      }
    });
  },
  /**
   * @function {Promise} onPrev
   * @parent i2web/pages/create-account/steps/name
   * @description Promise that should execute before going to the previous step.
   */
  onPrev() {
    return new Promise((advance) => {
      this.undoProgress(this.attr('stageName'));
      advance();
    });
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-billing-address',
  viewModel: ViewModel,
  view,
});
