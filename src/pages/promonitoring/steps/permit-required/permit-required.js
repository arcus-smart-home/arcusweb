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
import canDev from 'can-util/js/dev/';
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import view from './permit-required.stache';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';

/**
 * @module {canMap} i2web/pages/promonitoring/steps/permit-required Permit Required
 * @parent i2web/pages/promonitoring
 * @description ProMonitoring Signup Permit Code Entry Step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/promonitoring/steps/permit-required
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {ProMonitoringSettings} promonSettings
     * @parent i2web/pages/promonitoring/steps/permit-required
     * @description View model copy of promonitoring settings config to use for Save operation
     */
    promonSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {Boolean} permitRequired
     * @parent i2web/pages/promonitoring/steps/permit-required
     * @description Should permit information page indicate if permit is or may be required
     */
    permitRequired: {
      get() {
        return !!this.attr('promonSettings.promon:permitRequired');
      },
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/promonitoring/steps/permit-required
     * @description This step is always satisfied
     */
    isSatisfied: {
      type: 'boolean',
      value: true,
    },
  },
  /**
   * @function onActivate
   * @parent i2web/pages/promonitoring/steps/permit-required
   * @description Method invoked when user activates this step.
   */
  onActivate() {
    this.attr('promonSettings', this.attr('promonitoringSettings').clone());
  },
  /**
   * @function onNext
   * @parent i2web/pages/promonitoring/steps/permit-required
   * @description Method invoked when user presses button to move to next signup wizard step; saves the permit number.
   */
  onNext() {
    return this.attr('promonSettings').save();
  },
  /**
   * @property {error} onNextError
   * @parent i2web/pages/promonitoring/steps/permit-required
   * @description Method that should execute if onNext Promise is rejected.
   */
  onNextError(error) {
    canDev.warn(`${error.code} : ${error.message}`);
    this.attr('formError', 'Unable to save your Permit Code Number. Please try again later.');
  },
});

export default StepComponent.extend({
  tag: 'arcus-pro-monitoring-step-permit-required',
  viewModel: ViewModel,
  view,
});
