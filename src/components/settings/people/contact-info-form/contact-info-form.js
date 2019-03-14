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
import canMap from 'can-map';
import 'can-map-define';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import view from './contact-info-form.stache';
import Relationships from 'config/relationships.json';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/settings/people/contact-info-form
     * @description Form validation constraints
     */
    constraints: {
      get() {
        return new canMap({
          'person.person:firstName': {
            presence: true,
          },
          'person.person:lastName': {
            presence: true,
          },
          'person.person:email': {
            // email only required for full access guests
            presence: (this.attr('accessType') === 'FULL_ACCESS'),
            // validate for an email if one is entered
            email: this.attr('person.person:email'),
          },
          confirmEmail: {
            // validate equality if this value or an email was entered
            equality: (this.attr('confirmEmail') || this.attr('person.person:email') ? {
              attribute: 'person.person:email',
              message: '^Email addresses do not match',
            } : false),
          },
          'person.person:mobileNumber': {
            phoneNumber: !!this.attr('person.person:mobileNumber'),
          },
          pinCode: {
            format: {
              // only validate pin code if one is entered
              pattern: (this.attr('pinCode') ? /^\d{4}$/i : ''),
              message: 'must be 4 digits',
            },
          },
          verifyPinCode: {
            // check for matching pin codes if they have entered a pin code or this value
            equality: (this.attr('verifyPinCode') || this.attr('pinCode') ? {
              attribute: 'pinCode',
              message: '^PIN Codes do not match',
            } : false),
          },
          pleaseDescribe: {
            // only required if a relationship is entered and other is chosen
            presence: (this.attr('relationship').toLowerCase() === 'other'),
          },
        });
      },
    },
    /**
     * @property {string} accessType
     * @parent i2web/components/settings/people/contact-info-form
     * @description The access type of the guest that is being created
     */
    accessType: {
      type: 'string',
      set(accessType) {
        this.resetErrors();
        return accessType;
      },
    },
    /**
     * @property {string} invitationText
     * @parent i2web/components/settings/people/contact-info-form
     * @description The invitation text that will be sent in an email to the Invitee.
     */
    invitationText: {
      get() {
        const ownerName = (this.attr('place.web:userOwnsPlace')) ? 'their' : this.attr('possesiveOwnerName');
        return `Great News! ${this.attr('inviterName')} has invited you to ${ownerName} Place called ${this.attr('place.place:name')}.`;
      },
    },
    /**
     * @property {string} confirmEmail
     * @parent i2web/components/settings/people/contact-info-form
     * @description Confirmation of the email entered
     */
    confirmEmail: {
      type: 'string',
    },
    /**
     * @property {string} inviterName
     * @parent i2web/components/settings/people/contact-info-form
     * @description The inviter's name
     */
    inviterName: {
      type: 'string',
    },
    /**
     * @property {string} personalizedGreeting
     * @parent i2web/components/settings/people/contact-info-form
     * @description When inviting a full access guest, this is the additional invitation text
     */
    personalizedGreeting: {
      type: 'string',
    },
    /**
     * @property {string} pleaseDescribe
     * @parent i2web/components/settings/people/contact-info-form
     * @description Description of the 'other' relationship
     */
    pleaseDescribe: {
      type: 'string',
    },
    /**
     * @property {string} possesiveOwnerName
     * @parent i2web/components/settings/people/contact-info-form
     * @description The possesive form of the inviter's name
     */
    possesiveOwnerName: {
      get() {
        const name = this.attr('place.web:owner.person:name');
        if (name) {
          return (name.slice(-1) === 's') ? `${name}'` : `${name}'s`;
        }
        return '';
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/settings/people/contact-info-form
     * @description The place the person is associated with (used to acquire the person's access)
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Person} person
     * @parent i2web/components/settings/people/contact-info-form
     * @description The person we are editing contact info for
     */
    person: {
      get(person) {
        if (person) {
          this.attr('addingPerson', false);
          return person;
        }
        return new Person({});
      },
      set(person) {
        this.attr('confirmEmail', person.attr('person:email'));
        return person;
      },
    },
    /**
     * @property {boolean} addingPerson
     * @parent i2web/components/settings/people/contact-info-form
     * @description Whether we are adding a new person or editing an existing one
     */
    addingPerson: {
      value: true,
    },
    /**
     * @property {string} pinCode
     * @parent i2web/components/settings/people/contact-info-form
     * @description The pin code of the person used for authorization
     */
    pinCode: {
      type: 'string',
    },
    /**
     * @property {string} relationship
     * @parent i2web/components/settings/people/contact-info-form
     * @description The selected relationship of the invitee
     */
    relationship: {
      type: 'string',
      value: 'Spouse/Partner',
    },
    /**
     * @property {Array<string>} relationships
     * @parent i2web/components/settings/people/contact-info-form
     * @description The array of all possible relationships to be selected from
     */
    relationships: {
      get() {
        return Relationships.map(r => r.display);
      },
    },
    /**
     * @property {string} verifyPinCode
     * @parent i2web/components/settings/people/contact-info-form
     * @description Verify the updated pin code of the person
     */
    verifyPinCode: {
      type: 'string',
    },
    missingFields: {
      get() {
        return [
          ['email address', this.attr('person.person:email')],
          ['phone number', this.attr('person.person:mobileNumber')],
          ['PIN Code', this.attr('pinCode')],
        ].map((field) => {
          return (!field[1]) ? field[0] : undefined;
        }).filter(field => !!field);
      },
    },
    /**
     * @function relationshipValue
     * @return [String]
     * @description Return the relationship (tag) in an array so add to the Person's base:tags
     */
    relationshipTag: {
      get() {
        const relation = _.find(Relationships, ['display', this.attr('relationship')]);
        if (relation.tag === 'people_service_other') {
          return this.attr('pleaseDescribe');
        }
        return relation.tag;
      },
    },
  },
  /**
   * @function createInvitation
   * @param {Place} place The place to create an invitiation for
   * @return {Invitation}
   * @description Create an invitiation based on the information provided by the invitee. Used
   * for creating Full Access Guests.
   */
  createInvitation(place) {
    const args = [
      this.attr('person.person:firstName'),
      this.attr('person.person:lastName'),
      this.attr('person.person:email'),
      this.attr('relationshipTag'),
    ];
    return place.CreateInvitation(...args)
    .then(({ invitation }) => {
      invitation.invitationText = this.attr('invitationText');
      invitation.personalizedGreeting = this.attr('personalizedGreeting');
      return invitation;
    });
  },
  /**
   * @function createPerson
   * @return {Person}
   * @description Create a person from the field information the User has provided. Used for
   * creating Partial Access Guests
   */
  createPerson() {
    const person = this.attr('person');
    person.attr({
      'base:tags': [this.attr('relationshipTag')],
      'web:pinCode': this.attr('pinCode'),
    }, false);
    return person;
  },
});

export default FormComponent.extend({
  tag: 'arcus-settings-people-contact-info-form',
  viewModel: ViewModel,
  view,
});
