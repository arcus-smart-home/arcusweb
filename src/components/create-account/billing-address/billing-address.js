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
import $ from 'jquery';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import { costOf } from 'i2web/helpers/global';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import view from './billing-address.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/create-account/billing-address
     *
     * @description Form validation constraints
     */
    constraints: {
      value: {
        zip: {
          presence: true,
          length: {
            maximum: 5,
            minimum: 5,
            message: 'must be 5 digits',
          },
          numericality: true,
        },
        street1: {
          presence: true,
        },
        city: {
          presence: true,
        },
        state: {
          presence: true,
        },
      },
    },
    /**
     * @property {string} city
     * @parent i2web/components/create-account/billing-address
     * @description The city entered in as part of the address
     */
    city: {
      get(city) {
        const sameAsHome = this.attr('sameAsHomeAddress');
        const place = this.attr('place');
        return (place && sameAsHome) ? place.attr('place:city') : city;
      },
    },
        /**
     * @property {string} instructionText
     * @parent i2web/components/create-account/billing-address
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
     * @property {Place} place
     * @parent i2web/components/create-account/billing-address
     *
     * @description The newly created Place associated with the Account
     */
    place: {
      Type: Place,
    },
    /**
     * @property {boolean} sameAsHomeAddress
     * @parent i2web/components/create-account/billing-address
     *
     * @description Billing address is the same as the User's home address
     */
    sameAsHomeAddress: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {string} state
     * @parent i2web/components/create-account/billing-address
     * @description The state entered in as part of the address
     */
    state: {
      get(state) {
        const sameAsHome = this.attr('sameAsHomeAddress');
        const place = this.attr('place');
        return (place && sameAsHome) ? place.attr('place:state') : state;
      },
    },
    /**
     * @property {string} street1
     * @parent i2web/components/create-account/billing-address
     * @description The first part of the street entered in as part of the address
     */
    street1: {
      get(street1) {
        const sameAsHome = this.attr('sameAsHomeAddress');
        const place = this.attr('place');
        return (place && sameAsHome) ? place.attr('place:streetAddress1') : street1;
      },
    },
    /**
     * @property {string} street2
     * @parent i2web/components/create-account/billing-address
     * @description The second part of the street entered in as part of the address
     */
    street2: {
      get(street2) {
        const sameAsHome = this.attr('sameAsHomeAddress');
        const place = this.attr('place');
        return (place && sameAsHome) ? place.attr('place:streetAddress2') : street2;
      },
    },
    /**
     * @property {string} state
     * @parent i2web/components/create-account/billing-address
     * @description The ZIP code entered in as part of the address
     */
    zip: {
      get(zip) {
        const sameAsHome = this.attr('sameAsHomeAddress');
        const place = this.attr('place');
        return (place && sameAsHome) ? place.attr('place:zipCode') : zip;
      },
    },
  },
  PlaceCapability,
});

export default FormComponent.extend({
  tag: 'arcus-create-account-billing-address',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel sameAsHomeAddress} change': function stateUpdated() {
      // we need to manually update the semantic-ui dropdown to render with the correct value
      if (this.viewModel.attr('sameAsHomeAddress')) {
        const state = this.viewModel.attr('place').attr('place:state');
        $(this.element).find('select').dropdown('set selected', state);
      } else if (!this.viewModel.attr('state')) {
        // restore the dropdown back to unselected state, if no state has been selected
        $(this.element).find('select').dropdown('clear');
        $(this.element).find('select').dropdown('set selected', '');
      }
    },
  },
});
