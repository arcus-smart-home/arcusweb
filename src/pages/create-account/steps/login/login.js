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

import _ from 'lodash';
import 'can-map-define';
import 'can-construct-super';
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import Account from 'i2web/models/account';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import AccountService from 'i2web/models/service/AccountService';
import InvitationService from 'i2web/models/service/InvitationService';
import Auth from 'i2web/models/auth';
import view from './login.stache';

/**
 * @module {canMap} i2web/pages/create-account/steps/login Create Login
 * @parent i2web/pages/create-account/steps/login
 * @description Account Creation Create Login step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:login',
    },
    /**
     * @property {Account} account
     * @parent i2web/pages/create-account/steps/login
     * @description The new account
     */
    account: {
      Type: Account,
    },
    /**
     * @property {boolean} accountExists
     * @parent i2web/pages/create-account/steps/login
     * @description Whether there is already an email or phone number registered
     */
    accountExists: {
      type: 'boolean',
      value: false,
      set(registered) {
        this.attr('showPrevButton', !registered);
        this.attr('showNextButton', !registered);
        return registered;
      },
    },
    /**
     * @property {boolean} authenticateFailed
     * @parent i2web/pages/create-account/steps/login
     * @description Whether the post-create authentication failed
     */
    authenticateFailed: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} bypass
     * @parent i2web/pages/create-account/steps/login
     * @description Whether to bypass this step because we have completed it
     */
    bypass: {
      get() {
        return !!this.attr('session');
      },
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/login
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        return this.attr('phoneNumber') && this.attr('emailAddress')
          && this.attr('password') && this.attr('confirmPassword');
      },
    },
    /**
     * @property {boolean} hasDependencies
     * @parent i2web/pages/create-account/steps/login
     * @description Has the required objects to render the form
     */
    hasDependencies: {
      type: 'boolean',
      get() {
        return this.attr('account') && this.attr('person') && this.attr('place');
      },
    },
    /*
     * @property {Boolean} invited
     * @parent i2web/pages/create-account/steps/login
     *
     * @description Only show staged-progress component on account-creation
     */
    invited: {
      type: 'htmlbool',
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/create-account/steps/login
     * @description Indicates if the current step is in a satisfied state and can advance
     */
    isSatisfied: {
      get() {
        return this.attr('hasChanges') || this.attr('hasCompleteState');
      },
    },
    /**
     * @property {boolean} keepUpToDate
     * @parent i2web/pages/create-account/steps/login
     * @description Keep User up to date on Arcus related news, etc.
     */
    keepUpToDate: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/create-account/steps/login
     * @description The initial Person of the new Account
     */
    person: {
      Type: Person,
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/create-account/steps/login
     * @description The initial Place of the new Account
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Object} session
     * @parent i2web/pages/create-account/steps/login
     * @description The application session. Is defined if the user is logged in.
     */
    session: {
      type: '*',
    },
  },
  /**
   * @property {Promise} acceptInvite
   * @parent i2web/pages/create-account/steps/login
   * @description Create an account given the provided information. Used in the
   * invitee flow
   */
  acceptInvite(email, password, person) {
    person['person:email'] = email;
    const code = this.attr('inviteCode');
    return new Promise((resolve, reject) => {
      InvitationService
        .AcceptInvitationCreateLogin(person, password, code, this.attr('inviteeEmail'))
          .then(() => {
            Auth.login(email, password, false)
              .then(resolve)
              .catch(() => {
                this.attr('accountExists', true);
                reject();
              });
          })
          .catch(() => {
            this.attr('accountExists', true);
            reject();
          });
    });
  },
  /**
   * @property {Promise} createAccount
   * @parent i2web/pages/create-account/steps/login
   * @description Authenticate the new 'Person'
   */
  authenticateUser() {
    return new Promise((resolve, reject) => {
      Auth.authenticate().then(() => {
        this.recordProgress(this.attr('stageName'));
        resolve();
      }).catch(() => {
        this.attr('accountExists', true);
        this.attr('authenticateFailed', true);
        reject();
      });
    });
  },
  /**
   * @property {Promise} createAccount
   * @parent i2web/pages/create-account/steps/login
   * @description Create an account given the provided information. Used in
   * the normal account creation flow
   */
  createAccount(email, password, optIn, person, place) {
    return new Promise((resolve, reject) => {
      AccountService.CreateAccount(email, password, optIn, false, person, place)
        .then(() => this.authenticateUser().then(resolve).catch(reject))
        .catch(() => {
          this.attr('accountExists', true);
          reject();
        });
    });
  },
  /**
   * @property {Promise} onNext
   * @parent i2web/pages/create-account/steps/login
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((resolve, reject) => {
      if (this.isValidForm()) {
        this.attr('person').attr('person:mobileNumber', this.attr('phoneNumber'));
        const email = this.attr('emailAddress');
        const password = this.attr('password');
        const optIn = this.attr('keepUpToDate').toString();
        const _person = _.pick(this.attr('person').serialize(), [
          'person:firstName',
          'person:lastName',
          'person:mobileNumber',
        ]);
        const _place = _.pick(this.attr('place').serialize(), [
          'base:tags',
          'place:zipCode',
        ]);
        const promised = (this.attr('invited'))
          ? this.acceptInvite(email, password, _person)
          : this.createAccount(email, password, optIn, _person, _place);
        promised.then((r) => {
          resolve(r);
        }).catch(reject);
      } else {
        this.focusOnFirstError();
        reject();
      }
    });
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-login',
  viewModel: ViewModel,
  view,
});
