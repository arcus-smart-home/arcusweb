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
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import view from './review-info.stache';

/**
 * @module {canMap} i2web/pages/create-account/steps/review-info ProMonitoring - Review Info
 * @parent i2web/pages/create-account/steps/review-info
 * @description Account Creation - ProMonitoring Important Information
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:promon.review-info',
    },
    /**
     * @property {Boolean} annualRequested
     * @parent i2web/pages/create-account/steps/review-info
     * @description Indicates if the user has requested an annual subscription plan
     */
    annualRequested: {
      get() {
        const place = this.attr('place');
        if (place) {
          const placeTags = place.attr('base:tags').attr();
          return placeTags.includes(`PREF_PLAN:${PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_ANNUAL}`);
        }
        return false;
      },
    },
    /**
     * @property {Boolean} bypass
     * @parent i2web/pages/create-account/steps/review-info
     * @description Only show this step when requiring acknowledgment of pro monitoring
     */
    bypass: {
      get() {
        const place = this.attr('place');
        if (place) {
          const placeTags = place.attr('base:tags').attr();
          return !(placeTags.includes(`PREF_PLAN:${PlaceCapability.SERVICELEVEL_PREMIUM_PROMON}`)
            || placeTags.includes(`PREF_PLAN:${PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_ANNUAL}`));
        }
        return false;
      },
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/review-info
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        return false;
      },
    },
    /**
     * @property {String} nextButtonLabel
     * @parent i2web/pages/create-account/steps/review-info
     * @description Label for the button that navigates to next step
     */
    nextButtonLabel: {
      type: 'string',
      value: 'Begin Test',
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/create-account/steps/review-info
     * @description The Person of the new Account
     */
    person: {
      Type: Person,
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/create-account/steps/review-info
     * @description The initial Place of the new Account
     */
    place: {
      Type: Place,
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/create-account/steps/review-info
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {boolean} prevIgnoresBypass
     * @parent i2web/pages/create-account/steps/review-info
     * @description When clicking previous, ignore the bypass check
     */
    prevIgnoresBypass: {
      type: 'boolean',
      value: true,
    },
  },
  /**
   * @function onActivate
   * @parent i2web/pages/create-account/steps/review-info
   * @description Method invoked when user activates this step.
   */
  onActivate() {
    window.scrollTo(0, 0);
  },
  /**
   * @property {Promise} onNext
   * @parent i2web/pages/create-account/steps/review-info
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((advance) => {
      this.beginTest();
      advance();
    });
  },
  /**
   * @function {Promise} onPrev
   * @parent i2web/pages/create-account/steps/review-info
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
  tag: 'arcus-create-account-step-review-info',
  viewModel: ViewModel,
  view,
});
