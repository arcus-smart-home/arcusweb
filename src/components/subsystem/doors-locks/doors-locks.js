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
import Place from 'i2web/models/place';
import Subsystem from 'i2web/models/subsystem';
import AppState from 'i2web/plugins/get-app-state';
import view from './doors-locks.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} activeDisplay
     * @parent i2web/components/subsystem/doors-locks
     * @description The active display of the doors and locks page
     */
    activeDisplay: {
      type: 'string',
      get() {
        const subpage = canRoute.attr('subpage');
        const page = canRoute.attr('page');
        const action = canRoute.attr('action');
        const defaultAction = 'status';
        const validPages = [defaultAction, 'access-list', 'settings'];
        if (page === 'services' && subpage === 'doors-locks' && validPages.indexOf(action) === -1) {
          canRoute.attr('action', defaultAction);
          return defaultAction;
        }
        return action || defaultAction;
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/doors-locks
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
     * @parent i2web/components/subsystem/doors-locks
     * @description The doors and locks subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  /**
   * @function changeDoorsLocksDisplay
   * @parent i2web/components/subsystem/doors-locks
   * @param {string} to Which content to display.
   * @description Click handlers to change the subsystem subpage
   */
  changeDoorsLocksDisplay(to) {
    canRoute.attr('action', to);
  },
  /**
   * @function doorsLocksDisplayed
   * @parent i2web/components/subsystem/doors-locks
   * @param {string} display Which content is currently displayed.
   * @return {boolean}
   * @description Used to indictate which button is active, will render 'active' or ''
   */
  doorsLocksDisplayed(display) {
    return this.attr('activeDisplay') === display;
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-doors-locks',
  viewModel: ViewModel,
  view,
});
