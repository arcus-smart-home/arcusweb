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
import $ from 'jquery';
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import Place from 'i2web/models/place';
import ProMonitoringService from 'i2web/models/service/ProMonitoringService';
import view from './zip-code.stache';


/**
 * @module {canMap} i2web/pages/create-account/steps/zip-code ZIP Code
 * @parent i2web/pages/create-account/steps/zip-code
 * @description Account Creation ZIP Code step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:zipcode',
    },
    /**
     * @property {boolean} bypass
     * @parent i2web/pages/create-account/steps/zip-code
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
     * @parent i2web/pages/create-account/steps/zip-code
     * @description A collection of the completed stages
     */
    completedStages: {
      Type: Array,
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/zip-code
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        const place = this.attr('place');
        // If we are auto-selecting Basic for them, we can skip zip code entry and
        // bypass to the address entry screen
        const preferredPlan = this.attr('place.base:tags')
          .filter(i => i.includes('PREF_PLAN:'));
        return (place.attr('place:state') && place.attr('place:zipCode'))
          || (this.attr('startedOnMobile') && preferredPlan.length && preferredPlan[0] === 'PREF_PLAN:BASIC');
      },
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/create-account/steps/zip-code
     * @description Indicates if the current step is in a satisfied state and can advance
     */
    isSatisfied: {
      get() {
        return this.attr('hasChanges') || this.attr('hasCompleteState');
      },
    },
    /**
     * @property {string} monitoringAvailable
     * @parent i2web/pages/create-account/steps/zip-code
     * @description Is ProMonitoring available in the User's area
     */
    monitoringAvailable: {
      type: 'string',
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/create-account/steps/zip-code
     * @description The initial Place of the new Account
     */
    place: {
      Type: Place,
    },
    /**
     * @property {boolean} prevIgnoresBypass
     * @parent i2web/pages/create-account/steps/zip-code
     * @description When clicking previous, ignore the bypass check
     */
    prevIgnoresBypass: {
      type: 'boolean',
      value: true,
    },
    /*
     * @property {Boolean} startedOnMobile
     * @parent i2web/pages/create-account/steps/zip-code
     * @description Indicates if user arrived here via mobile account creation link
     */
    startedOnMobile: {
      type: 'boolean',
    },
  },
  /**
   * @function cancelSubmission
   * @parent i2web/pages/create-account/steps/zip-code
   * @description Cancel the submission of the form
   */
  cancelSubmission(vm, el, ev) {
    ev.preventDefault();
  },
  /**
   * @function onActivate
   * @parent i2web/pages/create-account/steps/zip-code
   * @description called when the step is activated, we reset the state dropdown based on place:state value
   */
  onActivate() {
    const state = this.attr('place.place:state');
    if (state) {
      $('arcus-create-account-zip-code')
        .find('select')
        .dropdown('set selected', state);
    }
  },
  /**
   * @function {Promise} onNext
   * @parent i2web/pages/create-account/steps/zip-code
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((advance, stay) => {
      this.removeAttr('formError');
      if (this.isValidForm()) {
        const place = this.attr('place');
        ProMonitoringService.CheckAvailability(place.attr('place:zipCode'), place.attr('place:state'))
          .then(({ availability }) => {
            this.attr('monitoringAvailable', availability);
            this.recordProgress(this.attr('stageName'), {
              monitoringAvailable: this.attr('monitoringAvailable'),
              place: this.attr('place'),
            });
            advance();
          }).catch((e) => {
            // Note: No active session ; cannot use Error.log
            if (e.code === 'zip.unrecognized') {
              this.attr('formError', 'Please enter a valid ZIP code.');
            } else {
              this.attr('formError', 'Oops, there seems to be a problem. Please try again later.');
            }
            stay();
          });
      } else {
        this.focusOnFirstError();
        stay();
      }
    });
  },
});


export default StepComponent.extend({
  tag: 'arcus-create-account-step-zip-code',
  viewModel: ViewModel,
  view,
});
