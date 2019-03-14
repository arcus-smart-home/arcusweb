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

import $ from 'jquery';
import 'can-map-define';
import canDev from 'can-util/js/dev/';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import Place from 'i2web/models/place';
import ProMonitoringService from 'i2web/models/service/ProMonitoringService';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import SidePanel from 'i2web/plugins/side-panel';
import view from './promonitoring-info.stache!';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {Place} place
     * @parent i2web/components/settings/places/promonitoring-info
     * @description Current place
     */
    place: {
      Type: Place,
      set(place) {
        if (place) {
          ProMonitoringService.GetSettings(place.GetDestination()).then(({ settings }) => {
            this.attr('promonitoringSettings', settings);
          }).catch((e) => {
            canDev.warn(`Error getting Pro Monitoring Settings: ${e.message}`);
          });
        }
        return place;
      },
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/components/settings/places/promonitoring-info
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
      set(settings) {
        this.attr('promonSettings', settings.clone());
        return settings;
      },
    },
    /**
     * @property {ProMonitoringSettings} promonSettings
     * @parent i2web/components/settings/places/promonitoring-info
     * @description View model copy of promonitoring settings config to use for Save operation
     */
    promonSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {Boolean} saving
     * @parent i2web/components/settings/places/promonitoring-info
     * @description Whether or not the form has been submitted and has yet
     * to complete its operation.
     */
    saving: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @function savePromonInfo
   * @description Save updated promonitoring info
   */
  savePromonInfo(vm, el, ev) {
    ev.preventDefault();
    this.attr('saving', true);

    const stopSavingAndClose = () => {
      this.attr('saving', false);
      SidePanel.closeRight();
    };

    this.attr('promonSettings').save()
      .then(stopSavingAndClose)
      .catch(stopSavingAndClose);
  },
  /**
   * @function toggleSubheading
   * @param panel The active panel
   * @description Display a panel's subheader if it is closed, hide it if open.
   */
  toggleSubheader(panel, element) {
    const selector = 'arcus-accordion-panel-heading small';
    $(selector).show();
    const displayFn = (panel.attr('active')) ? 'hide' : 'show';
    element.find(selector)[displayFn]();
  },
});

export default FormComponent.extend({
  tag: 'arcus-settings-places-promonitoring-info',
  viewModel: ViewModel,
  view,
});
