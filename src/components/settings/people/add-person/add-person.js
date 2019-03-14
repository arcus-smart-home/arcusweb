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
import canList from 'can-list';
import Cornea from 'i2web/cornea/';
import Errors from 'i2web/plugins/errors';
import Notifications from 'i2web/plugins/notifications';
import SidePanel from 'i2web/plugins/side-panel';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import view from './add-person.stache';

import 'i2web/components/settings/people/edit-contact-info/';

const missingFieldDescription = {
  'email address': `Without an email address, this person will not receive emails about Alarms,
    Rules, or other transactional emails about your place`,
  'phone number': `Without a phone number, this person cannot be added to any Alarm Notification
    list.`,
  'PIN Code': `Without a PIN Code, this person will not be able to disarm your alarm, participate
    in your Alarm Notification list, or unlock any locks.`,
};

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} accessType
     * @parent i2web/components/settings/people/add-person
     * @description What type of access-type person are we going to create.
     * 'none' is the default, 'FULL_ACCESS', or 'HOBBIT' are other options.
     */
    accessType: {
      type: 'string',
      value: 'none',
    },
    /**
     * @property {Person} inviter
     * @parent i2web/components/settings/people/add-person
     * @description The current User of the place, the inviter
     */
    inviter: {
      Type: Person,
    },
    /**
     * @property {canList} missingFields
     * @parent i2web/components/settings/people/add-person
     * @description The list of fields missing on the contact-info-form. Only relevant
     * for adding a Partial Access Guest
     */
    missingFields: {
      Type: canList,
    },
    /**
     * @property {String} missingFieldText
     * @parent i2web/components/settings/people/add-person
     * @description The text to display to the User when they try to add a Partial Access Guest
     * and fields are missing.
     */
    missingFieldsText: {
      type: 'string',
      get() {
        const fields = (this.attr('missingFields') || []).sort((a, b) => {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        if (fields.length > 1) {
          let names = `${fields.slice(0, fields.length - 1).join(', ')}, and ${fields[fields.length - 1]}`;
          if (fields.length === 2) names = `${fields[0]} and ${fields[1]}`;
          return `Providing a${['a', 'e', 'i', 'o', 'u'].includes(names[0]) ? 'n' : ''} ${names} are recommended.`;
        }
        return missingFieldDescription[fields[0]];
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/settings/people/add-person
     * @description The place the person is associated with (used to acquire the person's access)
     */
    place: {
      Type: Place,
    },
  },
  /**
   * @function addOrInvitePerson
   * @parent i2web/components/settings/people/add-person
   * @description Send the invitation created by the contact-form to the platform
   */
  addOrInvitePerson(_, __, ev) {
    ev.preventDefault();
    this.attr('formError', null);
    if (this.formValidates()) {
      this.attr('saving', true);
      const place = this.attr('place');
      if (this.attr('accessType') === 'FULL_ACCESS') {
        this.sendInvitation(place);
      } else {
        this.addPersonTo(place);
      }
    } else {
      ev.stopPropagation();
    }
  },
  /**
   * @function addPersonTo
   * @parent i2web/components/settings/people/add-person
   * @param {Place} place
   * @description Add a person to a place, used for creating Partial Access Guests
   */
  addPersonTo(place) {
    const partialGuest = this.createPerson();
    const pin = partialGuest.removeAttr('web:pinCode');
    place.AddPerson(partialGuest.serialize(), null).then(({ newPerson }) => {
      Person.get({ 'base:address': newPerson }).then((person) => {
        const onSave = () => {
          const placeName = this.attr('place.place:name');
          const name = person.attr('person:name');
          Notifications.success(`'${name}' has been added to ${placeName}.`, 'icon-app-user-2');
          Cornea.emit('web place:GuestAdded');
        };

        if (pin) {
          const placeID = this.attr('place.base:id');
          person.ChangePinV2(placeID, pin).then(() => {
            onSave.call(this);
            SidePanel.closeRight();
            if (canRoute.attr('subpage') === 'places') {
              canRoute.removeAttr('action');
            }
          })
          .catch((e) => {
            this.attr('saving', false);
            Errors.log(e);
            onSave.call(this);
            SidePanel.contractRight();
            person.attr(`web:role:${placeID}`, 'HOBBIT');
            this.editPerson(person);
          });
        } else {
          onSave.call(this);
          SidePanel.closeRight();
          if (canRoute.attr('subpage') === 'places') {
            canRoute.removeAttr('action');
          }
        }
      }).catch((e) => {
        this.attr('saving', false);
        Errors.log(e);
        this.attr('formError', 'There was a problem adding a Person. Please try again.');
      });
    }).catch((e) => {
      this.attr('saving', false);
      this.attr('formError', 'There was a problem adding a Person. Please try again.');
      Errors.log(e);
    });
  },
  /**
   * @function editPerson
   * @param {Person} person
   *
   * @description Displays edit form in side panel when we encounter a pin error from the platform
   */
  editPerson(person) {
    const template = `<arcus-settings-people-edit-contact-info {(person)}="person" {place}="place" {initial-pin-error}="pinError"/>`;
    SidePanel.right(template, {
      person,
      place: this.compute('place'),
      pinError: 'Someone already has the PIN code that you entered. Please assign a unique PIN code for this person.',
    });
  },
  /**
   * @function sendInvitation
   * @param {Place} place
   * @description Send the invitation created by the contact-form to the platform, used for
   * creating Full Access Guests
   */
  sendInvitation(place) {
    this.createInvitation(place).then((invitation) => {
      return place.SendInvitation(invitation).then(() => {
        this.attr('saving', false);
        SidePanel.closeRight();
        canRoute.removeAttr('action');
        const name = `${invitation.inviteeFirstName} ${invitation.inviteeLastName}`;
        const placeName = this.attr('place.place:name');
        Notifications.success(`'${name}' has been invited to ${placeName}.`, `icon-app-user-2`);
        Cornea.emit('web person:InvitationSent');
      });
    }).catch((e) => {
      this.attr('saving', false);
      this.attr('formError', 'There was a problem adding a Person. Please try again.');
      Errors.log(e);
    });
  },
  /**
   * @function setAccessType
   * @parent i2web/components/settings/people/add-person
   * @param {String} to The string value to set the value of accessType.
   * @description Sets the accessType property when the user clicks on a radio button
   */
  setAccessType(to) {
    this.attr('accessType', to);
    SidePanel.expandRight();
  },
});

export default Component.extend({
  tag: 'arcus-settings-people-add-person',
  viewModel: ViewModel,
  view,
});
