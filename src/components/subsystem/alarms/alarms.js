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
import Analytics from 'i2web/plugins/analytics';
import AppState from 'i2web/plugins/get-app-state';
import Place from 'i2web/models/place';
import Subsystem from 'i2web/models/subsystem';
import SubsystemCapability from 'i2web/models/capability/Subsystem';
import view from './alarms.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} activeDisplay
     * @parent i2web/components/subsystem/alarms
     * @description The active display of the alarms page
     */
    activeDisplay: {
      type: 'string',
      get() {
        const subpage = canRoute.attr('subpage');
        const page = canRoute.attr('page');
        const action = canRoute.attr('action');
        const defaultAction = 'status';
        const validPages = [defaultAction, 'notification-list', 'settings'];
        if (page === 'services' && subpage === 'alarms' && validPages.indexOf(action) === -1) {
          canRoute.attr('action', defaultAction);
          return defaultAction;
        }
        return action || defaultAction;
      },
    },
    /**
     * @property {boolean} alerting
     * @parent i2web/components/subsystem/alarms
     * @description Whether we are alerting (i.e. there is a current incident)
     */
    alerting: {
      get() {
        return !!AppState().attr('currentIncident');
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/alarms
     * @description Where the displayed alarm information is configured
     */
    place: {
      Type: Place,
      get() {
        return AppState().attr('place');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/alarms
     * @description The alarm subsystem
     */
    subsystem: {
      Type: Subsystem,
      set(subs) {
        if (subs && subs.attr('subs:state') !== SubsystemCapability.STATE_ACTIVE) {
          this.routeToDashboard();
        }
        return subs;
      },
    },
  },
  /**
   * @function changeAlarmDisplay
   * @parent i2web/pages/alarms
   * @param {string} to Which content to display.
   * @description Click handlers to change the settings subpage
   */
  changeAlarmDisplay(to) {
    if (to === 'notification-list') {
      Analytics.tag('alarms.settings.notification');
    }
    canRoute.attr('action', to);
  },
  /**
   * @function alarmDisplayedIs
   * @parent i2web/pages/alarms
   * @param {string} display Which content is currently displayed.
   * @return {string}
   * @description Used to indictate which button is active, will render 'active' or ''
   */
  alarmDisplayedIs(display) {
    return !this.attr('alerting') && this.attr('activeDisplay') === display;
  },
  /**
   * @function routeToDashboard
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
  tag: 'arcus-subsystem-alarms',
  viewModel: ViewModel,
  view,
});
