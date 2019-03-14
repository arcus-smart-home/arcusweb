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
import Account from 'i2web/models/account';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import view from './important-info.stache';

/**
 * @module {canMap} i2web/pages/create-account/steps/important-info ProMonitoring - Important Info
 * @parent i2web/pages/create-account/steps/important-info
 * @description Account Creation - ProMonitoring Important Information
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:promon.complete',
    },
    /**
     * @property {Boolean} bypass
     * @parent i2web/pages/create-account/steps/important-info
     * @description Only show this step when requiring acknowledgment of pro monitoring
     */
    bypass: {
      get() {
        const place = this.attr('place');
        if (place) {
          const placeTags = place.attr('base:tags').attr();
          return !placeTags.includes(`PREF_PLAN:${PlaceCapability.SERVICELEVEL_PREMIUM_PROMON}`);
        }
        return false;
      },
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/important-info
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        return false;
      },
    },
    /**
     * @property {Account} account
     * @parent i2web/pages/create-account/steps/important-info
     * @description The new account
     */
    account: {
      Type: Account,
    },
    /**
     * @property {String} contextHeader
     * @parent i2web/pages/create-account/steps/important-info
     * @description The header for the ProMonitoring step
     */
    contextHeader: {
      type: 'string',
      value: 'Important Information for Professional Monitoring',
    },
    /**
     * @property {Boolean} isSatisfied
     * @parent i2web/pages/create-account/steps/important-info
     * @description Indicates if the current step is in a satisfied state;
     * used by the parent Wizard to determine if user can go to next step.
     */
    isSatisfied: {
      value: true,
    },
    /**
     * @property {String} nextButtonLabel
     * @parent i2web/pages/create-account/steps/important-info
     * @description Label for the button that navigates to next step
     */
    nextButtonLabel: {
      type: 'string',
      value: 'Complete Sign Up',
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/create-account/steps/important-info
     * @description The initial Place of the new Account
     */
    place: {
      Type: Place,
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/create-account/steps/important-info
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {htmlbool} showPrevButton
     * @parent i2web/pages/create-account/steps/important-info
     * @description Whether or not to show the Previous button
     */
    showPrevButton: {
      type: 'htmlbool',
      value: false,
    },
  },
  /**
   * @function onActivate
   * @parent i2web/pages/create-account/steps/important-info
   * @description called when the step is activated
   */
  onActivate() {
    window.scrollTo(0, 0);
    this.attr('account').Activate().catch(e => Error.log(e));
  },
  /**
   * @property {Promise} onNext
   * @parent i2web/pages/create-account/steps/important-info
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((advance) => {
      this.recordProgress(this.attr('stageName'));
      advance();
    });
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-important-info',
  viewModel: ViewModel,
  view,
});
