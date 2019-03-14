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
import StepComponent, { StepViewModel, StepEvents } from 'i2web/components/wizard/step/';
import view from './getting-started.stache';
import Place from 'i2web/models/place';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import ProMonitoringSettingsCapability from 'i2web/models/capability/ProMonitoringSettings';
import SidePanel from 'i2web/plugins/side-panel';


/**
 * @module {canMap} i2web/pages/promonitoring/steps/getting-started Getting Started
 * @parent i2web/pages/promonitoring
 * @description ProMonitoring Signup Getting Started Step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    /**
     * @property {Place} place
     * @parent i2web/pages/promonitoring/steps/getting-started
     * @description The current place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/promonitoring/steps/getting-started
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
      set(settings, setVal) {
        setVal(settings);
        this.validateAddress();
      },
    },
    /**
     * @property {boolean} validating
     * @parent i2web/pages/promonitoring/steps/getting-started
     * @description True when the place's address is in the process of being validated with the platform
     */
    validating: {
      type: 'boolean',
    },
    /**
     * @property {boolean} isAddressVerified
     * @parent i2web/pages/steps/getting-started
     * @description Checks to ensure address has been fully validated and confirmed as residential
     */
    isAddressVerified: {
      get() {
        return this.attr('promonitoringSettings.promon:addressVerification') === ProMonitoringSettingsCapability.ADDRESSVERIFICATION_RESIDENTIAL;
      },
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/steps/getting-started
     * @description Step is conplete if address is verified
     */
    isSatisfied: {
      get() {
        return this.attr('isAddressVerified');
      },
    },
  },
  /**
   * @function editPlaceAddress
   * @parent i2web/pages/promonitoring/steps/getting-started
   * @description Opens the edit form for current Place address in the right side panel
   */
  editPlaceAddress(vm, el, ev) {
    ev.preventDefault();
    SidePanel.right('<arcus-form-edit-address {(promonitoring-settings)}="promonitoringSettings" {(place)}="place" />', {
      promonitoringSettings: this.compute('promonitoringSettings'),
      place: this.compute('place'),
    });
  },
  /**
   * @function validateAddress
   * @parent i2web/pages/promonitoring/steps/getting-started
   * @description Validates the user's address
   */
  validateAddress() {
    const settings = this.attr('promonitoringSettings');
    if (settings) {
      this.attr('validating', true);
      settings.ValidateAddress().then(() => {
        this.attr('validating', false);
      }).catch((e) => {
        this.attr('validating', false);
        canDev.warn(`${e.code} : ${e.message}`);
      });
    }
  },
});

const events = Object.assign({}, StepEvents, {
  '{viewModel.promonitoringSettings} promon:addressVerification': function placeUpdated() {
    this.viewModel.validateAddress();
  },
});

export default StepComponent.extend({
  tag: 'arcus-pro-monitoring-step-getting-started',
  viewModel: ViewModel,
  view,
  events,
});
