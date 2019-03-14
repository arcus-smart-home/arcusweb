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
import StepComponent, { StepViewModel, StepEvents } from 'i2web/components/wizard/step/';
import view from './connection-test.stache';
import Person from 'i2web/models/person';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import ProMonitoringSettingsCapability from 'i2web/models/capability/ProMonitoringSettings';

/**
 * @module {canMap} i2web/pages/promonitoring/steps/connection-test Connection Test
 * @parent i2web/pages/promonitoring
 * @description ProMonitoring Signup Connection Test Step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/promonitoring/steps/connection-test
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/promonitoring/steps/connection-test
     * @description Current person
     */
    person: {
      Type: Person,
    },
    /**
     * @property {Boolean} disablePrevButton
     * @parent i2web/pages/promonitoring/steps/connection-test
     * @description Whether or not to disable the Prev button
     */
    disablePrevButton: {
      get() {
        return this.attr('promonitoringSettings.promon:testCallStatus') !== ProMonitoringSettingsCapability.TESTCALLSTATUS_FAILED;
      },
    },
    /**
     * @property {String} prevButtonLabel
     * @parent i2web/pages/promonitoring/steps/connection-test
     * @description Label for the Prev button
     */
    prevButtonLabel: {
      type: 'string',
      value: 'Back',
    },
    /**
     * @property {Boolean} showNextButton
     * @parent i2web/pages/promonitoring/steps/connection-test
     * @description Whether or not to show the Next button
     */
    showNextButton: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} bypass
     * @parent i2web/pages/promonitoring/steps/connection-test
     * @description Bypass this step if the test call has already succeeded
     */
    bypass: {
      get() {
        return this.attr('promonitoringSettings.promon:testCallStatus') === ProMonitoringSettingsCapability.TESTCALLSTATUS_SUCCEEDED;
      },
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/promonitoring/steps/connection-test
     * @description Indicates if the test call has already succeeded
     */
    isSatisfied: {
      get() {
        return this.attr('promonitoringSettings.promon:testCallStatus') === ProMonitoringSettingsCapability.TESTCALLSTATUS_SUCCEEDED;
      },
    },
  },
  ProMonitoringSettingsCapability,
  /**
   * @function retry
   * @parent i2web/pages/promonitoring/steps/connection-test
   * @description Retry the connection test operation
   */
  retry(ev) {
    ev.preventDefault();
    this.attr('promonitoringSettings').TestCall().catch((e) => {
      canDev.warn(e);
    });
  },
});

const events = Object.assign({}, StepEvents, {
  '{viewModel.promonitoringSettings} promon:testCallStatus': function onTestCallStatus(vm, ev, newVal) {
    if (newVal === ProMonitoringSettingsCapability.TESTCALLSTATUS_SUCCEEDED && this.viewModel.attr('isActive')) {
      this.viewModel.attr('parent').next();
    }
  },
});

export default StepComponent.extend({
  tag: 'arcus-pro-monitoring-step-connection-test',
  viewModel: ViewModel,
  view,
  events,
});
