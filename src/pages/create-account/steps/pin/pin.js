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
import view from './pin.stache';


/**
 * @module {canMap} i2web/pages/create-account/steps/pin PIN Code
 * @parent i2web/pages/create-account/steps/pin
 * @description Account Creation PIN Code step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:pin',
    },
    /**
     * @property {boolean} bypass
     * @parent i2web/pages/create-account/steps/pin
     * @description Whether to bypass this step because we have completed it
     */
    bypass: {
      get() {
        return this.attr('completedStages').includes(this.attr('stageName'))
          && this.attr('hasCompleteState');
      },
    },
    /**
     * @property {Array} completedStages
     * @parent i2web/pages/create-account/steps/pin
     * @description A collection of the completed stages
     */
    completedStages: {
      Type: Array,
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/pin
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        const person = this.attr('person');
        return person.attr('person:hasPin')
          && person.attr('person:placesWithPin.length') > 0;
      },
    },
    /*
     * @property {Boolean} invited
     * @parent i2web/pages/create-account/steps/pin
     *
     * @description Only show staged-progress component on account-creation
     */
    invited: {
      type: 'htmlbool',
    },
  },
  /**
   * @property {Promise} onNext
   * @parent i2web/pages/create-account/steps/pin
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((advance, stay) => {
      if (this.isValidForm()) {
        this.attr('person').ChangePinV2(this.attr('place.base:id'), this.attr('pinCode'))
          .then(() => {
            if (this.recordProgress) {
              this.recordProgress(this.attr('stageName'));
            }
            advance();
          })
          .catch((e) => {
            let message = e.message || e;
            if (e.code === 'pin.notUniqueAtPlace') {
              message = 'PIN Code not available. Please choose a different PIN Code.';
            }
            this.attr('formError', message);
            stay();
          });
      } else {
        this.focusOnFirstError();
        stay();
      }
    });
  },
  /**
   * @function {Promise} onPrev
   * @parent i2web/pages/create-account/steps/confirm-address
   * @description Promise that should execute before going to the previous step.
   */
  onPrev() {
    return new Promise((advance) => {
      if (this.undoProgress) {
        this.undoProgress(this.attr('stageName'));
      }
      advance();
    });
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-pin',
  viewModel: ViewModel,
  view,
});
