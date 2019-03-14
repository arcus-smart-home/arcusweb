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
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import Error from 'i2web/plugins/errors';
import view from './confirm-address.stache';


/**
 * @module {canMap} i2web/pages/create-account/steps/confirm-address Confirm Address
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
     * @parent i2web/pages/create-account/steps/confirm-address
     * @description Whether to bypass this step because we have completed it
     */
    bypass: {
      get() {
        return !this.attr('selectedSuggestion')
          && this.attr('completedStages').includes(this.attr('stageName'))
          && this.attr('hasCompleteState');
      },
    },
    /**
     * @property {Array} completedStages
     * @parent i2web/pages/create-account/steps/confirm-address
     * @description A collection of the completed stages
     */
    completedStages: {
      Type: Array,
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/confirm-address
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
     * @property {boolean} noMonitoringAvailable
     * @parent i2web/pages/create-account/steps/confirm-address
     * @description Whether to inform the User they have entered an address that is not
     * supported by pro-monitoring
     */
    noMonitoringAvailable: {
      value: false,
    },
    /**
     * @property {boolean} promonEnabled
     * @parent i2web/pages/create-account/steps/confirm-address
     * @description Is the service level of the promonitored? Required to confirm residential.
     */
    promonEnabled: {
      get() {
        const place = this.attr('place');
        if (place) {
          const placeTags = place.attr('base:tags').attr();
          return placeTags.includes(`PREF_PLAN:${PlaceCapability.SERVICELEVEL_PREMIUM_PROMON}`);
        }
        return false;
      },
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/create-account/steps/confirm-address
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /*
     * @property {Function} recordProgress
     * @parent i2web/pages/create-account/steps/confirm-address
     * @description Parent component's callback method that is invoked when child wants to record progress.
     */
    recordProgress: {
      type: '*',
    },
  },
  /**
   * @function {Promise} onNext
   * @parent i2web/pages/create-account/steps/confirm-address
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((advance, stay) => {
      const selectedSuggestion = this.attr('selectedSuggestion');
      const streetAddress = {
        line1: selectedSuggestion.attr('line1'),
        line2: selectedSuggestion.attr('line2'),
        city: selectedSuggestion.attr('city'),
        state: selectedSuggestion.attr('state'),
        zip: selectedSuggestion.attr('zip'),
      };
      const promises = [];
      promises.push(this.attr('place').UpdateAddress(streetAddress).catch((e) => {
        return Promise.reject(e);
      }));
      if (this.attr('promonEnabled')) {
        promises.push(this.attr('promonitoringSettings')
          .UpdateAddress(streetAddress, true).catch((e) => {
            return Promise.reject(e);
          }));
      }
      Promise.all(promises).then(() => {
        this.recordProgress(this.attr('stageName'), {
          place: this.attr('place'),
        });
        advance();
      }).catch((e) => {
        // do this so that we don't generate a state for address and end up at
        // security questions
        this.attr('place').attr('place:streetAddress1', '');
        // do this because we cannot update the place with an empty address
        this.attr('place').AddTags('PROMON_NOT_AVAILABLE')
          .then(() => {
            // https://eyeris.atlassian.net/browse/I2-5006
            // If the User refreshes we want them to end back at the Plans stage
            // and disable ProMonitoring as an option. This is in case they cose
            // the browser and come back, the state will be correct
            this.attr('monitoringAvailable', 'NONE');
            this.recordProgress(undefined, {
              monitoringAvailable: 'NONE',
              place: this.attr('place'),
            });

            this.attr('reason', e.code);
            this.attr('noMonitoringAvailable', true);
            Error.log(e);
            stay();
          }).catch();
      });
    });
  },
  /**
   * @function {Promise} onPrev
   * @parent i2web/pages/create-account/steps/confirm-address
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
  tag: 'arcus-create-account-step-confirm-address',
  viewModel: ViewModel,
  view,
});
