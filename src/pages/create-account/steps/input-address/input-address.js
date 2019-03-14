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

import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import PlaceCapability from 'i2web/models/capability/Place';
import PlaceService from 'i2web/models/service/PlaceService';
import ProMonitoringService from 'i2web/models/service/ProMonitoringService';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import Error from 'i2web/plugins/errors';
import view from './input-address.stache';

const verificationErrorMessage = 'The address could not be verified. Please ensure your address is correct and try again.';


/**
 * @module {canMap} i2web/pages/create-account/steps/input-address Input Address
 * @parent i2web/pages/create-account/steps
 * @description Account Creation Address entry & verification step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:address',
    },
    /**
     * @property {boolean} bypass
     * @parent i2web/pages/create-account/steps/input-address
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
     * @parent i2web/pages/create-account/steps/input-address
     * @description A collection of the completed stages
     */
    completedStages: {
      Type: Array,
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/input-address
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        const place = this.attr('place');
        return place.attr('place:streetAddress1')
          && place.attr('place:city')
          && place.attr('place:state')
          && place.attr('place:zipCode');
      },
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/create-account/steps/input-address
     * @description Indicates if the current step is in a satisfied state and can advance
     */
    isSatisfied: {
      get() {
        return this.attr('hasChanges') || this.attr('hasCompleteState');
      },
    },
    /**
     * @property {String} nextButtonLabel
     * @parent i2web/pages/create-account/steps/input-address
     * @description Label for the button that navigates to next step
     */
    nextButtonLabel: {
      value: 'Verify Address',
    },
    /**
     * @property {String} nextButtonLoadingLabel
     * @parent i2web/pages/create-account/steps/input-address
     * @description Label for the button that navigates to next step displayedwhile next step is loading
     */
    nextButtonLoadingLabel: {
      value: 'Verifying ...',
    },
    /**
     * @property {boolean} noMonitoringAvailable
     * @parent i2web/pages/create-account/steps/input-address
     * @description Whether to inform the User they have entered a zip code that is not
     * supported by pro-monitoring
     */
    noMonitoringAvailable: {
      value: false,
    },
    /**
     * @property {boolean} prevIgnoresBypass
     * @parent i2web/pages/create-account/steps/input-address
     * @description When clicking previous, ignore the bypass check
     */
    prevIgnoresBypass: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/create-account/steps/input-address
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /*
     * @property {Function} recordProgress
     * @parent i2web/pages/create-account/steps/input-address
     * @description Parent component's callback method that is invoked when child wants to record progress.
     */
    recordProgress: {
      type: '*',
    },
    /**
     * @property {Boolean} showPrevButton
     * @parent i2web/pages/create-account/steps/input-address
     * @description Whether or not to show the Previous button
     */
    showPrevButton: {
      get() {
        return this.attr('startedOnMobile');
      },
    },
    /**
     * @property {Boolean} startedOnMobile
     * @parent i2web/pages/create-account/steps/input-address
     * @description Uses the route to determine if user arrived here via mobile account creation link
     */
    startedOnMobile: {
      type: 'boolean',
    },
  },
  /**
   * @function onActivate
   * @parent i2web/pages/create-account/steps/input-address
   * @description called when the step is activated
   */
  onActivate() {
    this.attr('formError', null);
  },
  /**
   * @function {Promise} onNext
   * @parent i2web/pages/create-account/steps/input-address
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((resolve, reject) => {
      if (this.validateForm()) {
        const place = this.attr('place');
        const promonTag = `PREF_PLAN:${PlaceCapability.SERVICELEVEL_PREMIUM_PROMON}`;
        if (place.attr('base:tags').attr().includes(promonTag)) {
          ProMonitoringService.CheckAvailability(place.attr('place:zipCode'), place.attr('place:state'))
          .then(({ availability }) => {
            this.attr('noMonitoringAvailable', availability === 'NONE');
            if (!this.attr('noMonitoringAvailable')) {
              this.validateAddress(true, resolve, reject);
            } else {
              reject();
            }
          }).catch(e => Error.log(e));
        } else {
          this.validateAddress(false, resolve, reject);
        }
      } else {
        this.focusOnFirstError();
        reject();
      }
    });
  },
  validateAddress(promonSelected, resolve, reject) {
    const params = [{
      line1: this.attr('place.place:streetAddress1'),
      line2: this.attr('place.place:streetAddress2'),
      city: this.attr('place.place:city'),
      state: this.attr('place.place:state'),
      zip: this.attr('place.place:zipCode'),
    }];
    if (!promonSelected) {
      params.unshift(this.attr('place.base:id'));
    }
    const validator = (promonSelected) ? this.attr('promonitoringSettings') : PlaceService;
    return validator.ValidateAddress(...params)
      .then(({ suggestions }) => {
        if (suggestions.length === 0) {
          throw new Error('No suggestions provided.');
        }
        this.attr('formError', null);
        this.attr('suggestedAddresses', suggestions);
        resolve();
      })
      .catch(() => {
        this.attr('formError', verificationErrorMessage);
        reject();
      });
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-input-address',
  viewModel: ViewModel,
  view,
});
