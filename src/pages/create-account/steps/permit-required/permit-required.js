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
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import Errors from 'i2web/plugins/errors';
import view from './permit-required.stache';

/**
 * @module {canMap} i2web/pages/create-account/steps/permit-required ProMonitoring - Permit Required
 * @parent i2web/pages/create-account/steps/permit-required
 * @description Account Creation - ProMonitoring Permit Required
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:promon.permit-required',
    },
    /**
     * @property {Boolean} bypass
     * @parent i2web/pages/create-account/steps/permit-required
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
     * @parent i2web/pages/create-account/steps/permit-required
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        return false;
      },
    },
    /**
     * @property {Boolean} isSatisfied
     * @parent i2web/pages/create-account/steps/permit-required
     * @description Indicates if the current step is in a satisfied state;
     * used by the parent Wizard to determine if user can go to next step.
     */
    isSatisfied: {
      value: true,
    },
    /**
     * @property {boolean} prevIgnoresBypass
     * @parent i2web/pages/create-account/steps/permit-required
     * @description When clicking previous, ignore the bypass check
     */
    prevIgnoresBypass: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/create-account/steps/permit-required
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
  },
  /**
   * @function onActivate
   * @parent i2web/pages/create-account/steps/permit-required
   * @description Method invoked when user activates this step.
   */
  onActivate() {
    window.scrollTo(0, 0);
  },
  /**
   * @property {Promise} onNext
   * @parent i2web/pages/create-account/steps/permit-required
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((advance) => {
      this.saveSettings().then(() => {
        this.recordProgress(this.attr('stageName'), {
          promonitoringSettings: this.attr('promonitoringSettings'),
        });
        advance();
      }).catch(e => Errors.log(e));
    });
  },
  /**
   * @function {Promise} onPrev
   * @parent i2web/pages/create-account/steps/permit-required
   * @description Promise that should execute before going to the previous step.
   */
  onPrev() {
    return new Promise((advance) => {
      this.undoProgress(this.attr('stageName'));
      advance();
    });
  },
  /**
   * @function preventSubmit
   * @parent i2web/pages/create-account/steps/permit-required
   * @description Prevent the submission of the form when there is 1 security question and
   * enter is pressed.
   */
  preventSubmit(ev) {
    ev.preventDefault();
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-permit-required',
  viewModel: ViewModel,
  view,
});
