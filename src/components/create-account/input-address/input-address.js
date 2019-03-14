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
import PlaceCapability from 'i2web/models/capability/Place';
import template from './input-address.stache';

const InputAddressViewModel = FormViewModel.extend({
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
    zipCode: 'string',
    streetAddress: 'string',
    streetAddressOptionalLine: 'string',
    city: 'string',
    state: 'string',
    //
    constraints: {
      value: {
        zipCode: {
          presence: true,
          length: {
            maximum: 5,
            minimum: 5,
            message: 'must be 5 digits',
          },
        },
        streetAddress: { presence: true },
        city: { presence: true },
        state: { presence: true },
      },
    },
  },
  //
  formError: null, // error message to be displayed when something has gone wrong during a request
  verifying: false,  // true when making call for verification data
});

const InputAddressComponent = FormComponent.extend({
  tag: 'arcus-create-account-input-address',
  view: template,
  ViewModel: InputAddressViewModel,
});

export { InputAddressComponent as default, InputAddressViewModel };
