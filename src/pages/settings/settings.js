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
import Component from 'can-component';
import canRoute from 'can-route';
import canEvent from 'can-event';
import canMap from 'can-map';
import 'can-map-define';
import SidePanel from 'i2web/plugins/side-panel';
import Account from 'i2web/models/account';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import SessionService from 'i2web/models/service/SessionService';
import Errors from 'i2web/plugins/errors';
import view from './settings.stache';
import _ from 'lodash';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Account} account
     * @parent i2web/pages/settings
     * @description The account associated with the place
     */
    account: {
      Type: Account,
      remove() {
        this.removeAttr('invoices');
      },
    },
    /**
     * @property {String} activeDisplay
     * @parent i2web/pages/settings
     * @description The active display of the settings page
     */
    activeDisplay: {
      type: 'string',
      get() {
        const subpage = canRoute.attr('subpage');
        const page = canRoute.attr('page');
        const defaultPage = 'profile';
        const validPages = [defaultPage, 'service-plan', 'people', 'places', 'invitation-code'];
        if (page === 'settings' && !validPages.includes(subpage)) {
          canRoute.attr('subpage', defaultPage);
          return defaultPage;
        }
        return subpage || defaultPage;
      },
    },
    /**
     * @property {Boolean} isOwner
     * @parent i2web/pages/settings
     * @description Whether the currently logged in person is this place's account owner
     */
    isOwner: {
      type: 'boolean',
      get() {
        return this.attr('person.base:id') === this.attr('account.account:owner');
      },
    },
    /**
     * @property {String} newPlaceId
     * @parent i2web/pages/settings
     * @description The base id of a newly added place
     */
    newPlaceId: {
      type: 'string',
    },
    /**
     * @property {String} newPlaceName
     * @parent i2web/pages/settings
     * @description The name of a newly added place
     */
    newPlaceName: {
      type: 'string',
    },
    /**
     * @property {Boolean} newPlaceModalVisible
     * @parent i2web/pages/settings
     * @description The base id of a newly added place
     */
    newPlaceModalVisible: {
      get() {
        const newPlaceAdded = !!this.attr('newPlaceId');
        const showModal = this.attr('showNewPlaceModal');
        return newPlaceAdded && showModal;
      },
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/settings
     * @description sets properties related to the current person
     */
    person: {
      Type: Person,
      set(person) {
        if (person) {
          person.attr('person:placesWithPin').bind('length', _.debounce(() => {
            this.getPlaces(true);
          }, 100));
        }
        return person;
      },
      remove(person) {
        if (person) {
          canEvent.removeEventListener.call(person.attr('person:placesWithPin'), 'length');
        }
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/settings
     * @description The current place
     */
    place: {
      Type: Place,
      remove() {
        this.removeAttr('account');
      },
    },
    /**
     * @property {Place.List} places
     * @parent i2web/pages/settings
     * @description A list of the person's available places
     */
    places: {
      value() {
        const placeList = new Place.List([]);
        placeList.attr('comparator', 'place:name');
        return placeList;
      },
    },
    /**
     * @property {Boolean} showNewPlaceModal
     * @parent i2web/pages/settings
     * @description Set to true when the new place modal is shown and false when user dismisses it
     */
    showNewPlaceModal: {
      type: 'boolean',
    },
  },
  /**
   * @function addPerson
   * @parent i2web/pages/settings
   * @description Add a guest (full or partial) to the current place
   */
  addPerson() {
    canRoute.attr('action', 'add-person');
  },
  /**
   * @function addPlace
   * @parent i2web/pages/settings
   * @description Add a new place to the current owner's account
   */
  addPlace() {
    canRoute.attr('action', 'add-place');
  },
  /**
   * @function changeSettingsDisplayed
   * @parent i2web/pages/settings
   * @param {String} to Which content to display, one of 'profile', 'people', 'places', 'invites'
   *
   * @description Click handlers to change the settings subpage
   */
  changeSettingsDisplayed(to) {
    canRoute.removeAttr('action');
    canRoute.attr('subpage', to);
    this.attr('activeDisplay', to);
  },
    /**
   * @function getPlaces
   * @parent i2web/pages/settings
   * @param hasNewPlacesWithPin should be true when this is called as a side effect of pinned places changing
   * @description updates the list of places
   */
  getPlaces(hasNewPlacesWithPin) {
    const placeList = this.attr('places');
    const currentAddresses = placeList.map(place => place.attr('base:address'));
    SessionService.ListAvailablePlaces().then(({ places }) => {
      const placeDescriptors = places;
      const newAddresses = places.map(place => `SERV:place:${place.placeId}`);
      const addressesToRemove = _.difference(currentAddresses, newAddresses);
      const addressesToAdd = _.difference(newAddresses, currentAddresses);

      // handle removals
      addressesToRemove.forEach((address) => {
        const index = _.findIndex(placeList, (place) => {
          return place.attr('base:address') === address;
        });
        if (index !== -1) {
          placeList.splice(index, 1);
        }
      });

      // handle additions
      addressesToAdd.forEach((address) => {
        const placeId = address.split(':')[2];
        const descriptor = placeDescriptors.find((d) => { return d.placeId === placeId; });
        const isOwner = descriptor.role === 'OWNER';
        const placeName = descriptor.name;

        Place.get({ 'base:address': address }).then((currentPlace) => {
          currentPlace.attr('web:userOwnsPlace', isOwner);
          placeList.push(currentPlace);
        }).catch((e) => {
          Errors.log(e);
          // Place retrieval may error when user does not have sufficient permissions to access
          const place = new Place({
            'base:address': address,
            'base:id': placeId,
            'place:name': descriptor.name,
            'place:streetAddress1': descriptor.streetAddress1,
            'place:streetAddress2': descriptor.streetAddress2,
            'place:city': descriptor.city,
            'place:state': descriptor.state,
            'place:zipCode': descriptor.zipCode,
            'web:userOwnsPlace': isOwner,
          });
          placeList.push(place);
        });
        // Get ready to show a modal for the newly added place owned by the current user
        if (hasNewPlacesWithPin && isOwner) {
          this.attr('newPlaceId', placeId);
          this.attr('newPlaceName', placeName);
          this.attr('showNewPlaceModal', true);
        }
      });
    }).catch((e) => {
      Errors.log(e, true);
    });
  },
  /**
   * @function isPanelActive
   * @param panel The panel in question, in this instance an accordian item
   * @description Check to see if the accordian item matches up to the what
   * panel should be active based on the route
   */
  isPanelActive(panel) {
    const routeAction = canRoute.attr('action') || 'contact-info';
    return routeAction === panel;
  },
  /**
   * @function settingsDisplayed
   * @parent i2web/pages/settings
   * @param {String} display Which content is currently display, one of 'profile', 'people', 'places', 'invites'
   * @return {String}
   * @description Used to indictate which button is active, will render 'active' or ''
   */
  settingsDisplayed(display) {
    return this.attr('activeDisplay') === display;
  },
  /**
   * @function showAddPersonPanel
   * @parent i2web/pages/settings
   * @description Open the side panel to add a person when the click handler is called
   * or the route action includes add-person
   */
  showAddPersonPanel() {
    const template = `<arcus-settings-people-add-person {inviter}="inviter" {place}="place" />`;
    SidePanel.right(template, {
      inviter: this.compute('person'),
      place: this.compute('place'),
    }, SidePanel.ON_CLOSE_REMOVE_ROUTE_ACTION);
  },
  /**
   * @function showAddPlacePanel
   * @parent i2web/pages/settings
   * @description Open the side panel to add a place when the click handler is called
   * or the route action includes add-place
   */
  showAddPlacePanel() {
    let serviceLevel = this.attr('place.place:serviceLevel');
    if (this.attr('place.isPromon')) {
      // A new place will be downgraded from Promon to an equivalent Premium service level
      // Use this info to control the content of the modal displayed after PIN is saved
      this.attr('isDowngraded', true);
      serviceLevel = serviceLevel === PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_FREE
        ? PlaceCapability.SERVICELEVEL_PREMIUM_FREE
        : PlaceCapability.SERVICELEVEL_PREMIUM;
    } else {
      this.attr('isDowngraded', false);
    }
    const template = `<arcus-settings-add-place {account}="account" {person}="person" {service-level}="serviceLevel"/>`;
    SidePanel.right(template, {
      account: this.compute('account'),
      person: this.compute('person'),
      serviceLevel,
    }, SidePanel.ON_CLOSE_REMOVE_ROUTE_ACTION);
  },
  /**
   * @function showEnterCodePanel
   * @parent i2web/pages/settings
   * @description Opens the side panel to accept an invitation code
   */
  showEnterCodePanel() {
    SidePanel.right(
      `<arcus-settings-invites-accept-code {person}="person" />`, {
        person: this.compute('person'),
      },
    );
  },
  /**
   * @function toggleOptIn
   * @parent i2web/pages/settings
   * @description Toggles the consent offer promotion on a person
   */
  toggleOptIn() {
    const optedIn = (this.attr('person.person:consentOffersPromotions') > 0) ? 0 : Date.now();
    this.attr('person').attr('person:consentOffersPromotions', optedIn);
    this.attr('optIn', this.attr('person.person:consentOffersPromotions'));

    this.attr('person').save();
  },
  /**
   * @function updateRoute
   * @param panel The active panel
   * @description Update the route based on the currently active panel
   */
  updateRoute(panel) {
    canRoute.attr('action', panel.attr('action'));
  },
});
const settings = Component.extend({
  tag: 'arcus-page-settings',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      canEvent.listenTo.call(this, canRoute, 'action', (__, action) => {
        const page = canRoute.attr('page') === 'settings';
        if (page && action) {
          if (action === 'add-person') {
            this.viewModel.showAddPersonPanel();
          } else if (action === 'add-place') {
            this.viewModel.showAddPlacePanel();
          }
        }
      });
      this.viewModel.getPlaces(false);
      if (canRoute.attr('action') === 'add-person') {
        this.viewModel.showAddPersonPanel();
      } else if (canRoute.attr('action') === 'add-place') {
        this.viewModel.showAddPlacePanel();
      }
    },
    removed() {
      canEvent.stopListening.call(this, canRoute, 'action');
    },
    '.newProperty focus': function inputIsolate(el) {
      $(el).closest('.panel-list-container').addClass('is-isolating');
    },
    '.newProperty blur': function inputUnIsolate(el) {
      $(el).closest('.panel-list-container').delay(200).removeClass('is-isolating');
    },
  },
});
export default settings;
