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

import Analytics from 'i2web/plugins/analytics';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import 'can-map-define';
import view from './delete-account.stache';
import Account from 'i2web/models/account';
import Person from 'i2web/models/person';
import auth from 'i2web/models/auth';

/**
 * @module {canMap} i2web/components/form/delete-account Delete Account
 * @parent i2web/components/form
 * @description Delete account form
 */
export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/form/delete-account
     *
     * @description Form validation constraints
     */
    constraints: {
      value: {
        delete: {
          presence: {
            message: 'Field cannot be blank',
          },
          format: {
            pattern: /delete/i,
            message: 'You must type DELETE to continue',
          },
        },
      },
    },
    /**
     * @property {Account} account
     * @parent i2web/pages/form/delete-account
     */
    account: {
      Type: Account,
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/form/delete-account
     */
    person: {
      Type: Person,
    },
    /**
    * @property {string} delete
    * @parent i2web/components/form/delete-account
    * @description needs to match "DELETE" not case sensitive
    */
    delete: {
      type: 'string',
    },
    /**
    * @property {boolean} showConfirm
    * @parent i2web/components/form/delete-account
    * @description If they really want to delete their account, second form pops up
    */
    showConfirm: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} isOwner
     * @parent i2web/components/form/delete-account
     * @description Whether the currently logged in person is this place's account owner
     */
    isOwner: {
      get() {
        return this.attr('person.base:id') === this.attr('account.account:owner');
      },
    },
  },
  /**
  * @function toggleConfirm
  * @param vm
  * @param el
  * @param ev
  * @parent i2web/components/form/delete-account
  * @description If the form is valid, show the next confirm form
  */
  toggleConfirm(vm, el, ev) {
    ev.preventDefault();
    if (this.formValidates()) {
      this.attr('showConfirm', true);
    } else {
      this.attr('showConfirm', false);
    }
  },
  /**
  * @function deleteAccount
  * @param vm
  * @param el
  * @param ev
  * @parent i2web/components/form/delete-account
  * @description delete account or just the user depending on if the current
  * user is account owner or not.
  */
  deleteAccount(vm, el, ev) {
    ev.preventDefault();
    if (this.formValidates()) {
      const tagName = `account.delete`;
      Analytics.tag(tagName);

      // If the current user is the account owner, delete entire account
      if (this.attr('isOwner')) {
        this.attr('account').Delete(true).then(() => {
          auth.logout();
        })
        .catch(() => {
          this.attr('formError', 'An error occurred trying to delete your account. Please try again later.');
        });
      // If the current user is not the account owner, just delete person
      } else {
        this.attr('person').DeleteLogin().then(() => {
          auth.logout();
        })
        .catch(() => {
          this.attr('formError', 'An error occurred trying to delete your account. Please try again later.');
        });
      }
    }
  },
});

export default FormComponent.extend({
  tag: 'arcus-form-delete-account',
  viewModel: ViewModel,
  view,
});
