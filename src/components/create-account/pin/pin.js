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
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import view from './pin.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/create-account/pin
     * @description Form validation constraints, keyed by field name
     */
    constraints: {
      value: {
        pinCode: {
          presence: true,
          format: {
            pattern: /^\d{4}$/i,
            message: 'must be 4 digits',
          },
          length: {
            minimum: 4,
            maximum: 4,
            message: 'must be 4 characters in length',
          },
        },
        confirmPinCode: {
          equality: {
            attribute: 'pinCode',
            message: '^Pin codes do not match',
          },
        },
      },
    },
    /*
     * @property {Boolean} invited
     * @parent i2web/components/create-account/pin
     *
     * @description Only show staged-progress component on account-creation
     */
    invited: {
      type: 'boolean',
    },
  },
});

export default FormComponent.extend({
  tag: 'arcus-create-account-pin',
  viewModel: ViewModel,
  view,
});
