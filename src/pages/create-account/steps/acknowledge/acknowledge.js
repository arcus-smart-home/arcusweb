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
import view from './acknowledge.stache';


/**
 * @module {canMap} i2web/pages/create-account/steps/acknowledge Acknowledge Pro-Monitoring
 * @parent i2web/pages/create-account/steps/acknowledge
 * @description Account Creation Acknowledge step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:promon.acknowledged',
    },
    /**
     * @property {Boolean} bypass
     * @parent i2web/pages/create-account/steps/acknowledge
     * @description Only show this step when requiring acknowledgment of pro monitoring
     */
    bypass: {
      get() {
        const place = this.attr('place');
        if (place) {
          const promonTag = `PREF_PLAN:${PlaceCapability.SERVICELEVEL_PREMIUM_PROMON}`;
          return !place.attr('base:tags').attr().includes(promonTag);
        }
        return false;
      },
    },
    /**
     * @property {Boolean} forceShowNextButton
     * @parent i2web/pages/create-account/steps/acknowledge
     * @description Whether at the last step or not, show the Next button
     */
    forceShowNextButton: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {Boolean} isSatisfied
     * @parent i2web/pages/create-account/steps/acknowledge
     * @description Whether or not the User can proceed to the next step
     */
    isSatisfied: {
      get() {
        return this.attr('acknowledged');
      },
    },
    /**
     * @property {string} prevButtonLabel
     * @parent i2web/pages/create-account/steps/acknowledge
     * @description Label for the button that navigates to next step
     */
    nextButtonLabel: {
      type: 'string',
      value: 'Continue',
    },
    /**
     * @property {Boolean} showPrevButton
     * @parent i2web/pages/create-account/steps/acknowledge
     * @description Whether or not to show the Previous button
     */
    showPrevButton: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @property {Promise} onNext
   * @parent i2web/pages/create-account/steps/acknowledge
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((advance, stay) => {
      if (this.attr('isSatisfied')) {
        this.recordProgress(this.attr('stageName'), {
          acknowledged: this.attr('acknowledged'),
        });
        advance();
      } else {
        stay();
      }
    });
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-acknowledge',
  viewModel: ViewModel,
  view,
});
