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

import Analytics from 'i2web/plugins/analytics';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-route';
import 'can-map-define';
import view from './header.stache';
import Person from 'i2web/models/person';
import SidePanel from 'i2web/plugins/side-panel';
import getAppState from 'i2web/plugins/get-app-state';
import 'i2web/components/add-menu/';
import 'i2web/components/place-selector/';
import 'i2web/components/logout-button.component';

export const ViewModel = canMap.extend({
  define: {
    /**
    * @property {Boolean} showNavigation
    * @parent i2web/components/header
    *
    * Show navigation? Yes or no.
    */
    showNavigation: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {String} placeId
     * @parent i2web/components/header
     */
    placeId: {
      type: 'string',
    },
    /**
     * @property {Person} person
     * @parent i2web/components/header
     */
    person: {
      Type: Person,
    },
    /**
     * @property {boolean} isAccountLoading
     * @parent i2web/components/header
     * @description if the account model is still loading
     */
    isAccountLoading: {
      type: 'boolean',
      get() {
        return undefined === getAppState().attr('account');
      },
    },
  },
  /**
  * @function toggleNavigation
  * @parent i2web/components/header
  *
  * toggles the navigation
  */
  toggleNavigation() {
    this.attr('showNavigation', !this.attr('showNavigation'));
  },
  /**
   * @function showAddMenu
   * @parent i2web/components/header
   *
   * Opens the arcus-add-menu component in the right side panel
   */
  showAddMenu() {
    if (this.attr('account.account:state') !== 'COMPLETE') return;
    const tagName = 'dashboard.add.menu';
    Analytics.tag(tagName);
    SidePanel.right('<arcus-add-menu />');
  },
  /**
   * @function showPlaceSelector
   * @parent i2web/components/header
   *
   * Calls for the place-selector component to be shown by the right side-panel.
   * The place selector requires the placeId and the person from the application state.
   */
  showPlaceSelector() {
    if (this.attr('account.account:state') !== 'COMPLETE') return;
    SidePanel.right('{{close-button type="cancel"}}<div class="panel-content"><h3>Choose a Place</h3><arcus-place-selector {(current-place-id)}="placeId" {person}="person" /><arcus-logout-button /></div>', {
      person: this.attr('person'),
      placeId: this.compute('placeId'),
    });
  },
});

export default Component.extend({
  tag: 'arcus-header',
  viewModel: ViewModel,
  view,
  events: {
    'a.header-route click': function headerRouteClicked(el, ev) {
      const vm = this.viewModel;
      if (vm.attr('account.account:state') !== 'COMPLETE') {
        ev.preventDefault();
      }
    },
  },
});
