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
import canList from 'can-list';
import 'can-map-define';
import Cornea from 'i2web/cornea/';
import Place from 'i2web/models/place';
import Person from 'i2web/models/person';
import Errors from 'i2web/plugins/errors';
import getAppState from 'i2web/plugins/get-app-state';
import ProMonitoringService from 'i2web/models/service/ProMonitoringService';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import SidePanel from 'i2web/plugins/side-panel';
import view from './place.stache';

import 'i2web/components/form/edit-address/';
import 'i2web/components/settings/places/cancel-invitation/';
import '../remove-place/';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Place} place
     * @parent i2web/components/settings/places/place
     * @description The place
     */
    place: {
      Type: Place,
      set(place) {
        if (place) {
          ProMonitoringService.GetSettings(place.GetDestination()).then(({ settings }) => {
            this.attr('promonitoringSettings', settings);
          }).catch(e => Errors.log(e));
          place.peopleWithAccess().then(people => this.attr('people', people));       // eslint-disable-line promise/catch-or-return
          place.invitedToAccess().then(invitees => this.attr('invitees', invitees));  // eslint-disable-line promise/catch-or-return
        }
        return place;
      },
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/components/settings/places/place
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {Person.List} people
     * @parent i2web/components/settings/places/place
     * @description A list of people associated with the given place. It is ordered first by
     * person's role then by person's first name.
     */
    people: {
      Type: Person.List,
      set(people) {
        const userID = getAppState().attr('person.base:id');
        return people.filter((person) => {
          return person['base:id'] !== userID;
        });
      },
    },
    /**
     * @property {Person.List} invitees
     * @parent i2web/components/settings/places/place
     * @description A list of people invited to the given place. It is ordered first by
     * person's role then by person's first name.
     */
    invitees: {
      Type: canList,
    },
    /**
     * @property {boolean} placeHasPeople
     * @parent i2web/components/settings/places/place
     * @description Whether or not a place has People to render. This is true if a combination of people and
     * invitees are greater than zero.
     */
    placeHasPeople: {
      type: 'boolean',
      get() {
        const inviteesLength = this.attr('invitees.length') || 0;
        const peopleLength = this.attr('people.length') || 0;
        return (inviteesLength + peopleLength) > 0;
      },
    },
    /**
     * @property {boolean} allowRemoveAccess
     * @parent i2web/components/settings/places/place
     * @description Indicates if the logged-in user's access to the place can be removed
     */
    allowRemoveAccess: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {boolean} allowRemovePlace
     * @parent i2web/components/settings/places/place
     * @description Indicates if the place can be removed during Edit operations
     */
    allowRemovePlace: {
      type: 'boolean',
      value: true,
    },
  },
  /**
   * @function canEditPerson
   * @parent i2web/components/settings/places/place
   * @param {Person} listedPerson
   *
   * @description Whether the currently logged in user can edit information for a listed person;
   * True when listed person is NOT OWNER
   * @return {Boolean}
   */
  canEditPerson(listedPerson) {
    const place = this.attr('place');
    if (place) {
      return listedPerson.getPlaceRole(place.attr('base:id')) !== 'OWNER';
    }
    return false;
  },
  /**
   * @function editPlace
   * @parent i2web/components/settings/places/place
   *
   * @description Click handlers to open side panel and show edit place form
   */
  editPlace() {
    if (this.attr('place').attr('isPromon')) {
      SidePanel.right('<arcus-form-edit-address {(promonitoring-settings)}="promonitoringSettings" {(place)}="place" {allow-remove-place}="allowRemovePlace" show-place-name />', {
        promonitoringSettings: this.compute('promonitoringSettings'),
        place: this.compute('place'),
        allowRemovePlace: this.compute('allowRemovePlace'),
      });
    } else {
      SidePanel.right(`<arcus-form-edit-address {(place)}="place" {allow-remove-place}="allowRemovePlace" show-place-name />`, {
        place: this.compute('place'),
        allowRemovePlace: this.compute('allowRemovePlace'),
      });
    }
  },
  /**
   * @function showPromonInfo
   * @parent i2web/components/settings/places/place
   *
   * @description Click handlers to open side panel and show promonitoring info
   */
  showPromonInfo() {
    SidePanel.right(`<arcus-settings-places-promonitoring-info {place}="place" />`, {
      place: this.compute('place'),
    });
  },
  /**
   * @function removeAccess
   * @parent i2web/components/settings/places/place
   *
   * @description Click handlers to open side panel and remove access panel
   */
  cancelInvitation(invitee) {
    SidePanel.right(`{{close-button type="cancel"}} <arcus-settings-cancel-invitation {(invitee)}="invitee" {place}="place" />`, {
      invitee,
      place: this.compute('place'),
    });
  },
  /**
   * @function removeAccess
   * @parent i2web/components/settings/places/place
   *
   * @description Click handlers to open side panel and remove access panel
   */
  removeAccess() {
    SidePanel.right(`{{close-button type="cancel"}} <arcus-settings-remove-place {(place)}="place" {(person)}="person" />`, {
      place: this.compute('place'),
      person: getAppState().attr('person'),
    });
  },
  /**
   * @function editPerson
   * @parent i2web/components/settings/places/place
   *
   * @description Click handlers to open side panel and show edit place form
   */
  editPerson(person) {
    const template = `<arcus-settings-people-edit-contact-info {(person)}="person" {place}="place" />`;
    SidePanel.right(template, {
      person,
      place: this.compute('place'),
    });
  },
});

// Client sides events thrown by different components to respond to people
// being added/invited or removed from a specific Place. Needed because
// the Platform does not provided adequate events and data.
const peoplePlaceEvents = [
  'web person:InvitationSent',
  'web person:InvitationCancelled',
  'web place:GuestAdded',
  'web place:GuestRemoved',
];

export default Component.extend({
  tag: 'arcus-settings-place',
  viewModel: ViewModel,
  view,
  events: {
    /**
     * @function onInviteEvents
     * @parent i2web/components/settings/places/place
     * @description The callback used by all People and Places events to re-request
     * the people and invitees associated with this Place
     */
    onInviteEvents() {
      const vm = this.viewModel;
      vm.attr('place').peopleWithAccess().then(people => vm.attr('people', people));      // eslint-disable-line promise/catch-or-return
      vm.attr('place').invitedToAccess().then(invitees => vm.attr('invitees', invitees)); // eslint-disable-line promise/catch-or-return
    },

    '{appState.people} length': 'onInviteEvents',
    inserted() {
      this.onInviteEvents = this.onInviteEvents.bind(this);
      peoplePlaceEvents.map(event => Cornea.on(event, this.onInviteEvents));
    },
    removed() {
      peoplePlaceEvents.map(event => Cornea.removeListener(event, this.onInviteEvents));
    },
  },
});
