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

import canMap from 'can-map';
import 'can-map-define';
import 'can-construct-super';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import view from './login.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /*
     * @property {canMap} constraints
     * @parent i2web/components/create-account/login
     *
     * @description Form validation constraints
     */
    constraints: {
      get() {
        return new canMap({
          firstName: {
            presence: true,
          },
          lastName: {
            presence: true,
          },
          phoneNumber: {
            presence: true,
            phoneNumber: true,
          },
          emailAddress: {
            email: {
              message: 'is invalid',
            },
          },
          password: {
            length: {
              minimum: 8,
              message: 'must be at least 8 characters',
            },
            exclusion: {
              within: [this.attr('emailAddress')],
              message: 'cannot be your email address',
            },
            oneLetterOneNumber: true,
            noSpaces: true,
          },
          confirmPassword: {
            equality: {
              attribute: 'password',
              message: '^Passwords do not match',
            },
          },
        });
      },
    },
    /*
     * @property {Boolean} invited
     * @parent i2web/components/create-account/login
     * @description Only show staged-progress component on account-creation
     */
    invited: {
      type: 'boolean',
    },
  },
});

export default FormComponent.extend({
  tag: 'arcus-create-account-login',
  viewModel: ViewModel,
  view,
});
