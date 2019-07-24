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

import 'can-map-define';
import 'can-construct-super';
import moment from 'moment';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import { costOf } from 'i2web/helpers/global';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import view from './billing-info.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/create-account/billing-info
     * @description Form validation constraints
     */
    constraints: {
      value: {
        firstName: {
          presence: true,
        },
        lastName: {
          presence: true,
        },
        cardNumber: {
          presence: true,
          cardNumber: true,
        },
        cvv: {
          presence: true,
          numericality: {
            onlyInteger: true,
          },
          length: {
            minimum: 3,
            maximum: 4,
            message: 'must be 3 or 4 digits',
          },
        },
        expMonth: {
          presence: true,
        },
        expYear: {
          presence: true,
        },
      },
    },
    /**
     * @property {string} cardNumber
     * @parent i2web/components/create-account/billing-info
     * @description Billing Card Number
     */
    cardNumber: {
      type: 'string',
    },
    /**
     * @property {string} cvv
     * @parent i2web/components/create-account/billing-info
     * @description CVV/Security Number
     */
    cvv: {
      type: 'string',
    },
    /**
    * @property {Array} expirationYearOptions
    * @parent i2web/components/create-account/billing-info
    * @description Array of the current year plus the next ten years,
    * used as the source for the expiration year
    */
    expirationYearOptions: {
      value() {
        const thisYear = moment().year();
        const years = [];
        for (let i = 0; i < 10; i++) {
          years.push(i + thisYear);
        }
        return years;
      },
    },
    /**
     * @property {string} month
     * @parent i2web/components/create-account/billing-info
     * @description Card expiration month
     */
    expMonth: {
      type: 'string',
    },
    /**
     * @property {string} year
     * @parent i2web/components/create-account/billing-info
     * @description Card expiration year
     */
    expYear: {
      type: 'string',
    },
    /**
     * @property {string} firstName
     * @parent i2web/components/create-account/billing-info
     * @description Billing first name
     */
    firstName: {
      type: 'string',
    },
    /**
     * @property {string} instructionText
     * @parent i2web/components/create-account/billing-info
     * @description The text displayed to the User informing them how they
     * will be charged for the plan
     */
    instructionText: {
      get() {
        const tags = this.attr('place.base:tags');
        if (tags && tags.length > 0) {
          const preference = tags.attr().find(a => a.includes('PREF_PLAN:'));
          if (!preference) { return ''; }

          const plan = preference.split(':')[1];
          let cost = costOf(plan, true);
          switch (plan) {
            case PlaceCapability.SERVICELEVEL_PREMIUM:
              return `Your Card will be charged ${cost}. Remember, this is not
                a long-term contract. Change your plan at any time.`;
            case PlaceCapability.SERVICELEVEL_PREMIUM_ANNUAL:
              cost = costOf(plan, true, 'year');
              return `Your Card will be charged ${cost}.`;
            default:
              return '';
          }
        }
        return '';
      },
    },
    /**
     * @property {string} lastName
     * @parent i2web/components/create-account/billing-info
     * @description Billing last name
     */
    lastName: {
      type: 'string',
    },
    /**
     * @property {Person} person
     * @parent i2web/components/create-account/billing-info
     * @description The Person on the newly created Account
     */
    person: {
      Type: Person,
      set(person) {
        if (person) {
          this.attr('firstName', person.attr('person:firstName'));
          this.attr('lastName', person.attr('person:lastName'));
        }
        return person;
      },
    },
    /**
     * @property {Place} person
     * @parent i2web/components/create-account/billing-info
     * @description The Place on the newly created Account
     */
    place: {
      Type: Place,
    },
  },
});

export default FormComponent.extend({
  tag: 'arcus-create-account-billing-info',
  viewModel: ViewModel,
  view,
});
