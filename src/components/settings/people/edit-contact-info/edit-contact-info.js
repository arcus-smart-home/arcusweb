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
import 'can-map-define';
import Errors from 'i2web/plugins/errors';
import SidePanel from 'i2web/plugins/side-panel';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import view from './edit-contact-info.stache!';

import 'i2web/components/settings/places/remove-place/';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {boolean} hasFullAccess
     * @parent i2web/components/settings/people/edit-contact-info
     * @description Whether the 'person' has full access to the 'place'.
     */
    hasFullAccess: {
      type: 'boolean',
      get() {
        return this.attr('role') === 'FULL_ACCESS';
      },
    },
    /**
     * @property {Person} person
     * @parent i2web/components/settings/people/edit-contact-info
     * @description The person we are editing contact info for
     */
    person: {
      Type: Person,
      set(person) {
        this.attr('formPerson', person.clone());
        return person;
      },
    },
    /**
     * @property {Person} person
     * @parent i2web/components/settings/people/edit-contact-info
     * @description A copy of the person, used for editing.
     */
    formPerson: {
      Type: Person,
    },
    /**
     * @property {Place} place
     * @parent i2web/components/settings/people/edit-contact-info
     * @description The place the person is associated with (used to acquire the person's access)
     */
    place: {
      Type: Place,
    },
    /**
     * @property {string} role
     * @parent i2web/components/settings/people/edit-contact-info
     * @description The person's role at a particular place
     */
    role: {
      type: 'string',
      get() {
        const person = this.attr('person');
        const place = this.attr('place');
        return (person && place) ? person.getPlaceRole(place.attr('base:id')) : '';
      },
    },
    /**
     * @property {string} pinCode
     * @parent i2web/components/settings/people/edit-contact-info
     * @description The person's pinCode at a particular place
     */
    pinCode: {
      type: 'string',
    },
    /**
     * @property {string} initialPinError
     * @parent i2web/components/settings/people/edit-contact-info
     * @description Indicates if the person has been created with a non-unique pin that needs to be changed.
     */
    initialPinError: {
      type: 'string',
    },
  },
  /**
   * @function updatePin
   * @parent i2web/components/settings/people/edit-contact-info
   * @description Check if a new pin has been entered and update it even if the rest of the person information is same.
   */
  updatePin() {
    let didUpdate = false;
    const onSave = () => {
      this.attr('saving', false);
      SidePanel.closeRight();
    };
    if (this.attr('pinCode')) {
      this.attr('person').ChangePinV2(this.attr('place.base:id'), this.attr('pinCode')).then(onSave).catch((e) => {
        this.attr('saving', false);
        if (e.statusText === 'Unauthorized') {
          this.attr('formError', 'You are not currently authorized to change this PIN.');
        } else if (e.code === 'pin.notUniqueAtPlace') {
          this.attr('formError', 'Someone already has the PIN code that you entered. Please assign a unique PIN code for this person.');
        } else {
          this.attr('formError', e.message);
        }
        Errors.log(e);
      });
      didUpdate = true;
    } else {
      onSave.call(this);
    }
    return didUpdate;
  },
  /**
   * @function saveContactInfo
   * @parent i2web/components/settings/people/edit-contact-info
   * @description Save the guest's updated contact information
   */
  saveContactInfo(vm, el, ev) {
    ev.preventDefault();
    this.removeAttr('initialPinError');
    this.removeAttr('formError');
    if (this.formValidates()) {
      this.attr('saving', true);
      this.attr('formPerson').save().then(this.updatePin).catch((e) => {
        // if `formPerson` is unchanged we will get an exception. We should try to update pin and if there is no pin changed / provided, we should show the error message.
        if (!this.updatePin()) {
          this.attr('saving', false);
          this.attr('formError', 'Unable to update your contact information. Please try again later.');
          Errors.log(e);
        }
      });
    } else {
      ev.stopPropagation();
    }
  },
  /**
   * @function removePerson
   * @parent i2web/components/settings/people/edit-contact-info
   *
   * @description Click handler to show remove person panel
   */
  removePerson() {
    SidePanel.right(`{{close-button type="cancel"}} <arcus-settings-remove-place {(place)}="place" {(person)}="person" />`, {
      place: this.compute('place'),
      person: this.compute('person'),
    });
  },
});

export default Component.extend({
  tag: 'arcus-settings-people-edit-contact-info',
  viewModel: ViewModel,
  view,
});
