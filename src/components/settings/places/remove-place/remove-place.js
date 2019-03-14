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

import { FormComponent, FormViewModel } from 'i2web/components/form/';
import 'can-map-define';
import Cornea from 'i2web/cornea/';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import getAppState from 'i2web/plugins/get-app-state';
import Notifications from 'i2web/plugins/notifications';
import SidePanel from 'i2web/plugins/side-panel';
import Errors from 'i2web/plugins/errors';
import view from './remove-place.stache!';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/settings/places/remove-place
     *
     * @description Form validation constraints
     */
    constraints: {
      value: {
        remove: {
          presence: {
            message: 'Field cannot be blank',
          },
          format: {
            pattern: /remove/i,
            message: 'You must type REMOVE to continue',
          },
        },
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/settings/places/remove-place
     * @description The place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Person} person
     * @parent i2web/components/settings/places/remove-place
     * @description The person to remove from the place
     */
    person: {
      Type: Person,
    },
    /**
     * @property {boolean} isPersonGuest
     * @parent i2web/components/settings/places/remove-place
     * @description Whether or not the person is a guest of the place
     */
    isPersonGuest: {
      type: 'boolean',
      get() {
        const place = this.attr('place');
        const person = this.attr('person');
        const role = person.getPlaceRole(place.attr('base:id'));

        return role !== 'OWNER';
      },
    },
    /**
     * @property {boolean} isPersonUser
     * @parent i2web/components/settings/places/remove-place
     * @description Whether or not the person is the current user
     */
    isPersonUser: {
      type: 'boolean',
      get() {
        const user = getAppState().attr('person');
        const person = this.attr('person');

        if (!user) {
          return false;
        }

        return user === person;
      },
    },
    /**
     * @property {string} removeButtonLabel
     * @parent i2web/components/settings/places/remove-place
     * @description Returns an appropriate button label based on how panel is being used
     */
    removeButtonLabel: {
      type: 'string',
      get() {
        if (this.attr('isPersonGuest')) {
          if (this.attr('isPersonUser')) {
            return 'Remove My Access';
          }
          return 'Remove Person';
        }
        return 'Remove Place';
      },
    },
    /**
     * @property {string} remove
     * @parent i2web/components/settings/places/remove-place
     * @description Confirmation string to remove person from place
     */
    remove: {
      type: 'string',
    },
    /**
     * @property {boolean} showConfirm
     * @parent i2web/components/settings/places/remove-place
     * @description Whether or not to show the confirmation panel
     */
    showConfirm: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @function confirmRemove
   * @parent i2web/components/settings/places/remove-place
   * @description Click handler to prompt confirming the removal of the person
   */
  confirmRemove(vm, el, ev) {
    ev.preventDefault();
    ev.stopImmediatePropagation();

    if (this.formValidates()) {
      this.attr('showConfirm', true);
    }
  },
  /**
   * @function removePlace
   * @parent i2web/components/settings/places/remove-place
   * @description Click handler to remove the person from the place or delete the place, depending on
   * whether or not the person is a guest.
   */
  removePlace(vm, el, ev) {
    const isPersonGuest = this.attr('isPersonGuest');
    const isPersonUser = this.attr('isPersonUser');

    ev.preventDefault();
    ev.stopImmediatePropagation();

    this.attr('saving', true);
    this[!isPersonGuest ? 'deletePlace' : 'removeAccess']().then(() => {
      this.attr('saving', false);
      this.attr('showConfirm', false);

      const placeName = this.attr('place.place:name');
      const personName = this.attr('person.person:name');
      let message = `${placeName} has been removed from your account.`;

      if (isPersonGuest && isPersonUser) {
        message = `Your access to ${placeName} has been removed.`;
      } else if (isPersonGuest) {
        message = `${personName} has been removed from ${placeName}`;
      }

      SidePanel.close();
      Notifications.success(`${message}`, 'icon-platform-home-2');
    }).catch((e) => {
      this.attr('saving', false);
      this.attr('formError', `${e.message} Please try again later. If you continue to have problems, please call Arcus support.`);
      Errors.log(e);
    });
  },
  /**
   * @function deletePlace
   * @parent i2web/components/settings/places/remove-place
   * @description Deletes the place altogether.
   */
  deletePlace() {
    return this.attr('place').Delete();
  },
  /**
   * @function removeAccess
   * @parent i2web/components/settings/places/remove-place
   * @description Removes access to the place for the person.
   */
  removeAccess() {
    const place = this.attr('place');
    const person = this.attr('person');

    return person.RemoveFromPlace(place.attr('base:id')).then(() => {
      Cornea.emit('web place:GuestRemoved');
    });
  },
});

export default FormComponent.extend({
  tag: 'arcus-settings-remove-place',
  viewModel: ViewModel,
  view,
});

