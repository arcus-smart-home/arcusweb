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
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import PlaceCapability from 'i2web/models/capability/Place';
import view from './billing-info.stache';


/**
 * @module {canMap} i2web/pages/create-account/steps/billing-info Billing Information
 * @parent i2web/pages/create-account/steps/billing-info
 * @description Account Creation Billing Information step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:billing',
    },
    /**
     * @property {Object} billingInfo
     * @parent i2web/pages/create-account/steps/billing-info
     * @description Object used to collect billing field information
     */
    billingInfo: {
      value: {
        errors: [],
        number: '',
        verification_value: '',
        month: '',
        year: '',
        first_name: '',
        last_name: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postal_code: '',
      },
    },
    /**
     * @property {Boolean} bypass
     * @parent i2web/pages/create-account/steps/billing-info
     * @description Only show this step when a billable plan is selected, if we have
     * all the required state or the selected plan is BASIC
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
     * @parent i2web/pages/create-account/steps/billing-info
     * @description A collection of the completed stages
     */
    completedStages: {
      Type: Array,
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/billing-info
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        const account = this.attr('account');
        return account && this.attr('account').attr('account:billingCCLast4');
      },
    },
  },
  onActivate() {
    const errors = this.attr('billingInfo.errors');
    if (errors) {
      const errorObject = {};
      errors.map((e) => { // eslint-disable-line array-callback-return
        errorObject[e] = [`${e.replace(/([A-Z])/g, ' $1')}`];
      });
      this.attr('validationErrors', errorObject);
    }
  },
  /**
   * @property {Promise} onNext
   * @parent i2web/pages/create-account/steps/billing-info
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((resolve, reject) => {
      if (this.isValidForm()) {
        return resolve();
      }
      this.focusOnFirstError();
      return reject();
    });
  },
  /**
   * @function {Promise} onPrev
   * @parent i2web/pages/create-account/steps/billing-info
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
  tag: 'arcus-create-account-step-billing-info',
  viewModel: ViewModel,
  view,
});
