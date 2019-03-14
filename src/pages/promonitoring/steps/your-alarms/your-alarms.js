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
import view from './your-alarms.stache';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import SidePanel from 'i2web/plugins/side-panel';
import 'i2web/pages/promonitoring/alarm-requirements.component';

/**
 * @module {canMap} i2web/pages/promonitoring/steps/your-alarms Your Alarms
 * @parent i2web/pages/promonitoring
 * @description ProMonitoring Signup Your Alarms Step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/promonitoring/steps/your-alarms
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
      set(settings) {
        const monitoredAlarms = settings.attr('promon:supportedAlerts');
        if (monitoredAlarms) {
          this.attr('isSecurityMonitored', monitoredAlarms.indexOf('SECURITY') > -1);
          this.attr('isSmokeMonitored', monitoredAlarms.indexOf('SMOKE') > -1);
          this.attr('isCOMonitored', monitoredAlarms.indexOf('CO') > -1);
          this.attr('isPanicMonitored', monitoredAlarms.indexOf('PANIC') > -1);
        }
        return settings;
      },
    },
    /**
     * @property {boolean} isPlaceMonitored
     * @parent i2web/pages/promonitoring/steps/your-alarms
     * @description Indicates if there are any alarms monitored on current place.
     */
    isPlaceMonitored: {
      get() {
        return this.attr('promonitoringSettings.promon:supportedAlerts')
          && this.attr('promonitoringSettings.promon:supportedAlerts').attr('length') > 0;
      },
    },
    /**
     * @property {boolean} isSecurityMonitored
     * @parent i2web/pages/promonitoring/steps/your-alarms
     * @description Indicates if Security devices are professionally monitored.
     */
    isSecurityMonitored: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} isSmokeMonitored
     * @parent i2web/pages/promonitoring/steps/your-alarms
     * @description Indicates if Smoke Detector devices are professionally monitored.
     */
    isSmokeMonitored: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} isCOMonitored
     * @parent i2web/pages/promonitoring/steps/your-alarms
     * @description Indicates if CO sensor devices are professionally monitored.
     */
    isCOMonitored: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} isPanicMonitored
     * @parent i2web/pages/promonitoring/steps/your-alarms
     * @description Indicates if Panic Button devices are professionally monitored.
     */
    isPanicMonitored: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/promonitoring/steps/your-alarms
     * @description User can navigate beyond this page immediately since it
     * is an information only page.
     */
    isSatisfied: {
      type: 'boolean',
      value: true,
    },
  },
  /**
   * @function viewRequirements
   * @parent i2web/pages/promonitoring/steps/your-alarms
   * @description Displays a side panel with alarm requirements.
   */
  viewRequirements(alarmType) {
    SidePanel.right('<arcus-alarm-requirements {reqType}="alarmType" />', {
      alarmType,
    });
  },
});

export default StepComponent.extend({
  tag: 'arcus-pro-monitoring-step-your-alarms',
  viewModel: ViewModel,
  view,
});
