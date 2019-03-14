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
import view from './zip-code.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /*
     * @property {canMap} constraints
     * @parent i2web/components/create-account/constraints
     *
     * @description Form validation constraints
     */
    constraints: {
      value: {
        state: {
          presence: true,
        },
        zipCode: {
          presence: true,
          length: {
            maximum: 5,
            minimum: 5,
            message: 'must be 5 digits',
          },
          numericality: true,
        },
      },
    },
  },
});

export default FormComponent.extend({
  tag: 'arcus-create-account-zip-code',
  viewModel: ViewModel,
  view,
});
