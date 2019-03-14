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
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import view from './reset-password.stache';
import Person from 'i2web/models/service/PersonService';

/**
 * @module {canMap} i2web/components/form/reset-password Reset Password
 * @parent i2web/components/form
 * @description Reset Password form
 */
export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/form/reset-password
     *
     * @description Form validation constraints
     */
    constraints: {
      get() {
        return new canMap({
          emailAddress: {
            presence: true,
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
          currentPassword: {
            presence: true,
          },
        });
      },
    },
    /**
    * @property {string} emailAddress
    * @parent i2web/components/form/reset-password
    *
    * User's email address
    */
    emailAddress: {
      type: 'string',
    },
    /**
    * @property {string} password
    * @parent i2web/components/form/reset-password
    *
    * Password requires minimum length of 8,
    * one letter and one number with no spaces
    */
    password: {
      type: 'string',
    },
    /**
    * @property {string} confirmPassword
    * @parent i2web/components/form/reset-password
    *
    * confirmPassword must match password
    */
    confirmPassword: {
      type: 'string',
    },
    /**
    * @property {string} currentPassword
    * @parent i2web/components/form/reset-password
    * User's current password, default: `null`
    */
    currentPassword: {
      type: 'string',
    },
  },
  /**
  * @property {Boolean} saving
  * @parent i2web/components/form/reset-password
  * whether the form is being saved
  */
  saving: false,
  /**
  * @function resetPassword
  * @parent i2web/components/form/reset-password
  *
  * @param vm
  * @param el
  * @param ev
  */
  resetPassword(vm, el, ev) {
    ev.preventDefault();

    if (!this.hasChanges()) {
      ev.stopPropagation();
      return;
    }

    if (this.formValidates()) {
      this.attr('saving', true);
      Person.ChangePassword(this.attr('currentPassword'), this.attr('password'), this.attr('emailAddress')).then(() => {
        this.attr('saving', false);
        this.closePanel();
      })
      .catch(() => {
        this.attr('saving', false);
        this.attr('formError', 'Unable to save your new password. Please verify your current password is correct.');
      });
    }
  },
});

export default FormComponent.extend({
  tag: 'arcus-form-reset-password',
  viewModel: ViewModel,
  view,
});
