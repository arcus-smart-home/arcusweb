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
import canDev from 'can-util/js/dev/';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import view from './additional-information.stache';

/**
 * @module {canMap} i2web/pages/promonitoring/steps/additional-information Additional Information
 * @parent i2web/pages/promonitoring
 * @description ProMonitoring Signup Additional Information Step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    /**
     * @property {Boolean} isSatisfied
     * @parent i2web/pages/promonitoring/steps/additional-information
     * @description Indicates that signup info and pin have been confirmed by user
     */
    isSatisfied: {
      get() {
        return this.attr('promonSettings.promon:adults') > 0;
      },
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/promonitoring/steps/additional-information
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {ProMonitoringSettings} promonSettings
     * @parent i2web/pages/promonitoring/steps/additional-information
     * @description View model copy of promonitoring settings config to use for Save operation
     */
    promonSettings: {
      Type: ProMonitoringSettings,
    },
  },
  /**
   * @function onActivate
   * @parent i2web/pages/promonitoring/steps/permit-required
   * @description Method invoked when user activates this step.
   */
  onActivate() {
    this.attr('promonSettings', this.attr('promonitoringSettings').clone());
    // Spinner control starts at 1, so ensure minimum number of adults initialized appropriately
    if (this.attr('promonSettings.promon:adults') === 0) {
      this.attr('promonSettings.promon:adults', 1);
    }
  },
  /**
   * @function onNext
   * @parent i2web/pages/promonitoring/steps/additional-information
   * @description Method invoked when user presses button to move to next signup wizard step. Saves user entries on the page.
   */
  onNext() {
    return this.attr('promonSettings').save();
  },
  /**
   * @property {error} onNextError
   * @parent i2web/pages/promonitoring/steps/additional-information
   * @description Method that should execute if onNext Promise is rejected; displays error to user.
   */
  onNextError(error) {
    canDev.warn(`${error.code} : ${error.message}`);
    this.attr('formError', 'Unable to save your information. Please try again later.');
  },
});

export default StepComponent.extend({
  tag: 'arcus-pro-monitoring-step-additional-information',
  viewModel: ViewModel,
  view,
});
