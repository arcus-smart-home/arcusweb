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

import Component from 'can-component';
import canMap from 'can-map';
import canRoute from 'can-route';
import 'can-map-define';
import getAppState from 'i2web/plugins/get-app-state';
import SubsystemCapability from 'i2web/models/capability/Subsystem';
import view from './climate.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} activeDisplay
     * @parent i2web/components/subsystem/climate
     * @description The active display of the climate page
     */
    activeDisplay: {
      get() {
        const subpage = canRoute.attr('subpage');
        const page = canRoute.attr('page');
        const action = canRoute.attr('action');
        const defaultAction = 'status';
        const validPages = [defaultAction, 'temperature', 'settings'];
        if (page === 'services' && subpage === 'climate' && validPages.indexOf(action) === -1) {
          canRoute.attr('action', defaultAction);
          return defaultAction;
        }
        return action || defaultAction;
      },
    },
    /**
     * @property {boolean} hasControlDevices
     * @parent i2web/components/subsystem/climate
     * @description Whether the place has any temperature-controllable devices paired
     */
    hasControlDevices: {
      get() {
        const controlDevices = this.attr('subsystem.subclimate:controlDevices');
        return controlDevices && controlDevices.attr('length');
      },
    },
    /**
     * @property {boolean} hasTemperatureDevices
     * @parent i2web/components/subsystem/climate
     * @description Whether the place has any temperature-reporting devices paired
     */
    hasTemperatureDevices: {
      get() {
        const temperatureDevices = this.attr('subsystem.subclimate:temperatureDevices');
        return temperatureDevices && temperatureDevices.attr('length');
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/climate
     * @description Where the displayed climate information is configured
     */
    place: {
      get() {
        return getAppState().attr('place');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/climate
     * @description The climate subsystem
     */
    subsystem: {
      set(subs) {
        if (subs && subs.attr('subs:state') !== SubsystemCapability.STATE_ACTIVE) {
          this.routeToDashboard();
        }
        return subs;
      },
    },
  },
  /**
   * @function changeClimateDisplay
   * @parent i2web/components/subsystem/climate
   * @param {string} to Which content to display.
   * @description Click handlers to change the settings subpage
   */
  changeClimateDisplay(to) {
    canRoute.attr('action', to);
  },
  /**
   * @function climateDisplayedIs
   * @parent i2web/components/subsystem/climate
   * @param {string} display Which content is currently displayed.
   * @return {string}
   * @description Used to indictate which button is active, will render 'active' or ''
   */
  climateDisplayedIs(display) {
    return this.attr('activeDisplay') === display;
  },
  /**
   * @function routeToDashboard
   * @parent i2web/components/subsystem/climate
   * @description redirects the user to the Dashboard page
   */
  routeToDashboard() {
    canRoute.attr({
      page: 'home',
      subpage: '',
      action: '',
    });
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-climate',
  viewModel: ViewModel,
  view,
});
