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

import CanMap from 'can-map';
import CanList from 'can-list';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import PlaceCapability from 'i2web/models/capability/Place';
import AppState from 'i2web/plugins/get-app-state';
import template from './confirm-address.stache';

const SuggestedAddressViewModel = CanMap.extend({
  define: {
    // formatted address markup
    formattedAddress: {
      get() {
        return `
          ${this.line1}<br>
          ${this.line2 ? `${this.line2}<br/>` : ''}
          ${this.city}, ${this.state} ${this.zip}
        `;
      },
    },
  },
});

SuggestedAddressViewModel.List = CanList.extend({ Map: SuggestedAddressViewModel }, {});

const ConfirmAddressViewModel = FormViewModel.extend({
  define: {
    promonSelected: {
      get() {
        const place = this.attr('place');
        if (place) {
          const placeTags = place.attr('base:tags').attr();
          return placeTags.includes(`PREF_PLAN:${PlaceCapability.SERVICELEVEL_PREMIUM_PROMON}`);
        }
        return false;
      },
    },
    suggestedAddresses: {
      type(listOrArray) {
        let array = listOrArray;

        // unwrap a CanList if passed. CanList itself isn't smart enough to notice that the
        // items of the input list are the wrong type and force a conversion :(
        if (listOrArray instanceof CanList) {
          array = listOrArray.attr();
        }
        return new SuggestedAddressViewModel.List(array);
      },
    },
    selectedSuggestion: {
      get(setVal) {
        const suggestedAddresses = this.attr('suggestedAddresses');
        // select first address if only one is available
        if (!setVal && suggestedAddresses && suggestedAddresses.length === 1) {
          return suggestedAddresses.attr(0);
        }
        return setVal;
      },
    },
    /**
     * @property {string} supportNumber
     * @parent i2web/components/create-account/billing-info
     * @description Retrive support number from AppState
     */
    supportNumber: {
      get() {
        return AppState().attr('supportNumber');
      },
    },
  },
  isSuggestionSelected(address) {
    return address === this.attr('selectedSuggestion');
  },
  promonConfirmed: false,
  togglePromonConfirmation() {
    this.attr('promonConfirmed', !this.attr('promonConfirmed'));
  },
  isSatisfied() {
    const selectionSatisfied = !!(this.attr('selectedSuggestion'));
    if (this.attr('promonSelected')) {
      return selectionSatisfied && this.attr('promonConfirmed');
    }
    return selectionSatisfied;
  },
});

const ConfirmAddressComponent = FormComponent.extend({
  tag: 'arcus-create-account-confirm-address',
  view: template,
  ViewModel: ConfirmAddressViewModel,
});

export { ConfirmAddressComponent as default, ConfirmAddressViewModel };
