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
import canRoute from 'can-route';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import view from './promon-trial.stache';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';

/**
 * @module {canMap} i2web/components/form/promon-trial Promonitoring Trial Code
 * @parent i2web/components/form
 * @description Promonitoring Trial Code Entry Form
 */
export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/form/promon-trial
     *
     * @description Form validation constraints, keyed by field name
     */
    constraints: {
      value: {
        trialCode: {
          presence: true,
        },
      },
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/components/form/promon-trial
     * @description Promonitoring settings config for the current place.
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {string} trialCode
     * @parent i2web/components/form/promon-trial
     * @description Trial code for Pro Monitoring sign up.
     */
    trialCode: {
      type: 'string',
    },
    /**
     * @property {integer} failedAttempts
     * @parent i2web/components/form/promon-trial
     * @description Indicates how many times user has failed to enter correct code
     */
    failedAttempts: {
      value: 0,
    },
  },
  /**
   * @property {boolean} saving
   * @parent i2web/components/form/promon-trial
   * @description Indicates whether the form input is being saved to the platform.
   */
  saving: false,
  /*
   * @function joinTrial
   * @parent i2web/components/form/promon-trial
   * @description Attempts to join pro monitoring trial with the user entered code.
   */
  joinTrial(vm, el, ev) {
    ev.preventDefault();

    if (!this.formValidates()) {
      return;
    }

    this.attr('saving', true);
    this.attr('promonitoringSettings').JoinTrial(this.attr('trialCode')).then(() => {
      this.attr('saving', false);
      this.closePanel();
      canRoute.attr({
        page: 'promonitoring',
        subpage: undefined,
      });
    }).catch(() => {
      this.attr('saving', false);
      this.attr('failedAttempts', (this.attr('failedAttempts') + 1));
      this.attr('formError', true);
    });
  },
});

export default FormComponent.extend({
  tag: 'arcus-form-promon-trial',
  viewModel: ViewModel,
  view,
});
