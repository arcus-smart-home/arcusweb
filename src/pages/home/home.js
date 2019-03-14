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

import _ from 'lodash';
import Analytics from 'i2web/plugins/analytics';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import canRoute from 'can-route';
import 'i2web/components/place-selector/';
import 'i2web/components/logout-button.component';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import Subsystem from 'i2web/models/subsystem';
import Device from 'i2web/models/device';
import Scene from 'i2web/models/scene';
import SidePanel from 'i2web/plugins/side-panel';
import view from './home.stache';


export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Array<Object>} availableCards
     * @parent i2web/pages/home
     * @description The cards of available subsystems (and favorites)
     */
    availableCards: {
      get() {
        const cards = this.attr('dashboardCards');
        return cards.filter((c) => {
          return c.serviceName === 'FAVORITES' || c.attr('subsystem.available');
        });
      },
    },
    /**
     * @property {Array<Object>} dashboardCards
     * @parent i2web/pages/home
     * @description An ordered list of dashboard subsystem cards
     */
    dashboardCards: {
      get() {
        const subsystems = this.attr('subsystems') || [];
        const cards = this.attr('preferences.dashboardCards') || [];

        return cards.filter((card) => {
          const name = card.attr('serviceName');

          if (card.attr('hideCard') || name === 'HISTORY') { return false; }
          if (name === 'FAVORITES') { return true; }

          const subsys = _.find(subsystems, a => a.attr('preferenceName') === name);
          if (subsys) { card.attr('subsystem', subsys); }
          return subsys;
        });
      },
    },
    /**
     * @property {Device.List} devices
     * @parent i2web/pages/home
     *
     * list of devices
     */
    devices: {
      Type: Device.List,
    },
    /**
     * @property {String} fromEmailLink
     * @parent i2web/pages/home
     *
     * @description Did the User come to the web by clicking on a link in an email?
     */
    fromEmailLink: {
      type: 'string',
    },
    /**
     * @property {canMap} historyPreference
     * @parent i2web/pages/home
     * @description The preference specifically related to the history panel
     */
    historyPreference: {
      Type: canMap,
    },
    /**
     * @property {boolean} isUnavailableSubsystems
     * @parent i2web/pages/home
     */
    isUnavailableSubsystems: {
      type: 'boolean',
      get() {
        const subsystems = this.attr('subsystems') || [];
        return subsystems.filter(subsystem => subsystem.attr('unavailable')).length !== 0;
      },
    },
    /**
     * @property {String} page
     * @parent i2web/pages/home
     */
    page: {
      type: 'string',
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/home
     */
    person: {
      Type: Person,
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/home
     */
    place: {
      Type: Place,
    },
    /**
     * @property {String} placeId
     * @parent i2web/pages/home
     */
    placeId: {
      type: 'string',
    },
    /**
     * @property {Object} preferences
     * @parent i2web/pages/home
     *
     * Collection of preferences used for card ordering
     */
    preferences: {
      Type: canMap,
      set(preferences) {
        if (preferences) {
          const history = preferences.attr('dashboardCards').filter((card) => {
            return (card.attr('serviceName') === 'HISTORY');
          });
          this.attr('historyPreference', history.attr('0'));
        }
        return preferences;
      },
    },
    /**
     * @property {*} refreshHistory
     * @parent i2web/components/event-list
     *
     * Refreshes the list for history
     */
    refreshHistory: {
      type: '*',
    },
    /**
     * @property {Scene.List} scenes
     * @parent i2web/pages/home
     *
     * list of scenes
     */
    scenes: {
      Type: Scene.List,
    },
    /**
     * @property {boolean} showSidebar
     * @parent i2web/pages/home
     */
    showSidebar: {
      type: 'boolean',
      get() {
        return !this.attr('historyPreference.hideCard');
      },
    },
    /**
     * @property {Subsystem.List} subsystems
     * @parent i2web/pages/home
     *
     * list of subsystems
     */
    subsystems: {
      Type: Subsystem.List,
    },
    /**
     * @property {Array<Object>} unavailableCards
     * @parent i2web/pages/home
     * @description The cards of unavailable subsystems
     */
    unavailableCards: {
      get() {
        const cards = this.attr('dashboardCards');
        return cards.filter((c) => {
          return c.serviceName !== 'FAVORITES' && !c.attr('subsystem.available');
        });
      },
    },
  },
  /**
   * @function retrieveHistory
   * @parent i2web/pages/home
   * @description retrieves the history events for the place
   */
  retrieveHistory() {
    return this.attr('place').ListDashboardEntries(5);
  },
  /**
   * @function routeToHistory
   * @parent i2web/components/event-list
   * Changes the route to the "history" page when the User clicks the "More"
   * button.
   */
  routeToHistory() {
    canRoute.attr('page', 'history');
  },
  /**
   * @function showPlaceSelector
   *
   * Calls for the place-selector component to be shown by the left side-panel.
   * The place selector requires the placeId from application the state.
   */
  showPlaceSelector() {
    SidePanel.left('{{close-button}}<arcus-place-selector {(current-place-id)}="placeId" {person}="person" /><arcus-logout-button />', {
      person: this.attr('person'),
      placeId: this.compute('placeId'),
    });
  },
  /**
   * @function toggleSidebar
   */
  toggleSidebar() {
    const tagName = 'nav.sidebar';
    Analytics.tag(tagName);
    const history = this.attr('historyPreference');
    history.attr('hideCard', !history.attr('hideCard'));
  },
});

export default Component.extend({
  tag: 'arcus-page-home',
  viewModel: ViewModel,
  view,
});
