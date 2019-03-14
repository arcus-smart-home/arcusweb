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
import StepComponent, { StepEvents, StepViewModel } from 'i2web/components/wizard/step/';
import PlaceCapability from 'i2web/models/capability/Place';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import ProMonitoringSettingsCapability from 'i2web/models/capability/ProMonitoringSettings';
import { tagForAnalytics } from 'i2web/plugins/account-creation';
import view from './connection-test.stache';

/**
 * @module {canMap} i2web/pages/create-account/steps/important-info ProMonitoring - Connection Test
 * @parent i2web/pages/create-account/steps/connection-test
 * @description Account Creation - ProMonitoring Connection Test
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:promon.test',
    },
    /**
     * @property {Boolean} bypass
     * @parent i2web/pages/create-account/steps/connection-test
     * @description Only show this step when requiring acknowledgment of pro monitoring
     */
    bypass: {
      get() {
        const place = this.attr('place');
        if (place) {
          const placeTags = place.attr('base:tags').attr();
          return !placeTags.includes(`PREF_PLAN:${PlaceCapability.SERVICELEVEL_PREMIUM_PROMON}`)
            || this.attr('promonitoringSettings.promon:testCallStatus') === ProMonitoringSettingsCapability.TESTCALLSTATUS_SUCCEEDED;
        }
        return false;
      },
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/connection-test
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        return false;
      },
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/create-account/steps/connection-test
     * @description Indicates if the test call has already succeeded
     */
    isSatisfied: {
      get() {
        return this.attr('promonitoringSettings.promon:testCallStatus') === ProMonitoringSettingsCapability.TESTCALLSTATUS_SUCCEEDED;
      },
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/create-account/steps/connection-test
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {Boolean} showNextButton
     * @parent i2web/pages/create-account/steps/connection-test
     * @description Whether or not to show the Next button
     */
    showNextButton: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @function onActivate
   * @parent i2web/pages/create-account/steps/connection-test
   * @description Method invoked when user activates this step.
   */
  onActivate() {
    window.scrollTo(0, 0);
  },
  /**
   * @property {Promise} onNext
   * @parent i2web/pages/create-account/steps/connection-test
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((advance) => {
      this.recordProgress(this.attr('stageName'));
      advance();
    });
  },
});

const events = Object.assign({}, StepEvents, {
  '{viewModel.promonitoringSettings} promon:testCallStatus': function onTestCallStatus(vm, ev, newVal) {
    if (newVal === ProMonitoringSettingsCapability.TESTCALLSTATUS_FAILED && this.viewModel.attr('isActive')) {
      tagForAnalytics(this.viewModel.attr('place'), 'web:promon.test.timeout');
    }
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-connection-test',
  viewModel: ViewModel,
  view,
  events,
});
