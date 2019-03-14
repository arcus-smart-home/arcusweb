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

import canRoute from 'can-route';
import canMap from 'can-map';
import 'can-map-define';
import { isIOS8 } from 'i2web/helpers/global';
import Person from 'i2web/models/service/PersonService';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import getAppState from 'i2web/plugins/get-app-state';
import view from './login.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/pages/login
     *
     * @description Form validation constraints
     */
    constraints: {
      get() {
        return new canMap({
          emailAddress: {
            presence: true,
            email: {
              message: 'is invalid',
            },
          },
          password: {
            presence: true,
          },
          code: {
            presence: true,
          },
          newPassword: {
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
              attribute: 'newPassword',
              message: '^Passwords do not match',
            },
          },
        });
      },
    },
    /**
    * @property {string} email
    * @parent i2web/pages/login
    *
    * @description users email address
    */
    emailAddress: {
      type: 'string',
    },
    /**
     * @property {boolean} isPublic
     * @parent i2web/pages/login
     * @description Indicates if the user has confirmed they are on a public computer.
     */
    isPublic: {
      type: 'boolean',
      value: false,
    },
    /**
    * @property {string} password
    * @parent i2web/pages/login
    *
    * @description password
    */
    password: {
      type: 'string',
    },
    /**
    * @property {string} code
    * @parent i2web/pages/login
    *
    * @description code
    */
    code: {
      type: 'string',
    },
    /**
    * @property {string} new_password
    * @parent i2web/pages/login
    *
    * @description new password
    */
    newPassword: {
      type: 'string',
    },
    /**
    * @property {string} cantRenderCreateAccount
    * @parent i2web/pages/login
    *
    * @description Cannot render create account
    */
    cannotRenderCreateAccount: {
      get() {
        return isIOS8();
      },
    },
    /**
    * @property {string} confirmPassword
    * @parent i2web/pages/login
    *
    * @description confirmation of new password
    */
    confirmPassword: {
      type: 'string',
    },
    /**
    * @property {Boolean} saving
    * @parent i2web/pages/login
    *
    * @description flag as to whether we are in a saving state
    */
    saving: {
      type: 'boolean',
      value: false,
    },
    /**
    * @property {Boolean} resetFromSendCode
    * @parent i2web/pages/login
    *
    * @description flag as to whether the user is accessing reset password from the send code screen
    */
    resetFromSendCode: {
      value: false,
    },
    /**
    * @property {String} sessionError
    * @parent i2web/pages/login
    *
    * @description Error to be presented above the login form
    */
    sessionError: {
      type: 'string',
      get() {
        return getAppState().attr('sessionError');
      },
      remove() {
        getAppState().removeAttr('sessionError');
      },
    },
    /**
     * @property {Boolean} fromEmailLink
     * @parent i2web/pages/login
     *
     * @description Did the User come to the web by clicking on a link in an email?
     */
    fromEmailLink: {
      get() {
        const subpage = canRoute.attr('subpage');
        return ['android', 'ios', 'web'].includes(subpage);
      },
    },
    /**
     * @property {Boolean} emailOrEmptySubpage
     * @parent i2web/pages/login
     *
     * @description Whether from a mobile device or logging in from the web
     */
    emailOrEmptySubpage: {
      get() {
        const subpage = canRoute.attr('subpage');
        return this.attr('fromEmailLink') || !subpage;
      },
    },
  },
  init() {
    this._super();
    canRoute.bind('subpage', () => {
      this.attr('resetFromSendCode', false);
      this.resetForm();
    });
  },
  /**
   * @function back
   * @parent i2web/pages/login
   *
   * @description Needed so that we do not undo the properties on subpage if
   * coming from mobile
   */
  back() {
    window.history.back();
  },
  /**
  * @function loginFormHasChanges
  * @parent i2web/pages/login
  *
  * @description Login form has changes to it's initial state
  */
  loginFormHasChanges() {
    // since emailAddress can prefill from other forms, if it's set, consider the form "changed"
    return this.hasChanges(['emailAddress', 'password']) || this.attr('emailAddress');
  },
  /**
  * @function sendCodeFormHasChanges
  * @parent i2web/pages/login
  *
  * @description Send code form has changes to it's initial state
  */
  sendCodeFormHasChanges() {
    // since emailAddress can prefill from other forms, if it's set, consider the form "changed"
    return this.hasChanges(['emailAddress']) || this.attr('emailAddress');
  },
  /**
  * @function resetPasswordFormHasChanges
  * @parent i2web/pages/login
  *
  * @description Reset password form has changes to it's initial state
  */
  resetPasswordFormHasChanges() {
    // since emailAddress can prefill from other forms, if it's set, consider the form "changed"
    return this.hasChanges(['emailAddress', 'code', 'newPassword', 'confirmPassword']) || this.attr('emailAddress');
  },
  /**
  * @function login
  * @parent i2web/pages/login
  * @param vm
  * @param el
  * @param ev
  * @description Attempts login only if the login form validates
  */
  login(vm, el, ev) {
    ev.preventDefault();
    if (!this.loginFormHasChanges()) {
      ev.stopPropagation();
      return;
    }

    if (this.formValidates(['emailAddress', 'password'])) {
      this.attr('saving', true);
      this.removeAttr('sessionError');
      this.attr('logInUser')(this.attr('emailAddress'), this.attr('password'), this.attr('isPublic')).then(() => {
        getAppState().attr('logoutRequested', false);
      }).catch(() => {
        this.attr('saving', false);
        this.attr('formError', 'Invalid username or password');
      });
    }
  },
  /**
  * @function sendCode
  * @parent i2web/pages/login
  * @param vm
  * @param el
  * @param ev
  * @description Sends email with a code if the form validates
  */
  sendCode(vm, el, ev) {
    ev.preventDefault();
    if (!this.sendCodeFormHasChanges()) {
      ev.stopPropagation();
      return;
    }

    // https://eyeris.atlassian.net/browse/I2-4960
    // The form was being submitted when clicking the 'Back' button from the
    // 'reset-password' page. Once the code was sent the subpage was set to
    // 'reset-password'. This prevents the form from being submitted on 'Back'
    if (this.formValidates(['emailAddress']) && canRoute.attr('subpage') === 'send-code') {
      this.attr('saving', true);
      Person.SendPasswordReset(this.attr('emailAddress'), 'email').then(() => {
        this.attr('saving', false);
        canRoute.attr('subpage', 'reset-password');
        this.attr('resetFromSendCode', true);
      }).catch(() => {
        this.attr('saving', false);
        // TODO this would only happen if the AJAX request fails, not on an invalid email. We should have a global handler for this.
        this.attr('formError', 'An error occurred sending the reset code. Please try again later.');
      });
    }
  },
  /**
  * @function resetPassword
  * @parent i2web/pages/login
  * @param vm
  * @param el
  * @param ev
  * @description If the code form validates, send them to reset password
  */
  resetPassword(vm, el, ev) {
    ev.preventDefault();
    if (!this.resetPasswordFormHasChanges()) {
      ev.stopPropagation();
      return;
    }

    if (this.formValidates(['emailAddress', 'code', 'newPassword', 'confirmPassword'])) {
      this.attr('saving', true);
      Person.ResetPassword(this.attr('emailAddress'), this.attr('code'), this.attr('newPassword')).then(() => {
        this.attr('saving', false);
        canRoute.attr('subpage', 'reset-confirmation');
      }).catch(({ message }) => {
        this.attr('saving', false);
        this.attr('formError', message);
      });
    }
  },
  /**
  * @function transitionTo
  * @parent i2web/pages/login
  * @param ev {Event}
  * @param page {String}
  * @param subpage {String}
  * @description Applies a transitioning class and slightly delays before re-routing the user
  */
  transitionTo(ev, page, subpage) {
    ev.preventDefault();
    this.resetErrors();
    const loginWrapper = document.querySelector('.login-wrapper');
    loginWrapper.classList.toggle('transitioning');
    setTimeout(() => {
      loginWrapper.classList.toggle('transitioning');
      canRoute.attr({ page, subpage });
    }, 400);
  },
});

const comp = FormComponent.extend({
  tag: 'arcus-page-login',
  viewModel: ViewModel,
  view,
});
export default comp;
