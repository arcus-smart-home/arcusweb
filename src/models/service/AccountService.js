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

import Bridge from 'i2web/cornea/bridge';

/**
 * @module {Object} i2web/models/AccountService AccountService
 * @parent app.models.services
 *
 * Entry points for the account service, which covers global operations on accounts not handled the account object capabilities.
 */
export default {
  /**
   * @function CreateAccount
   *
   * Creates an initial account, which includes the billing account, account owning person, default place, login credentials and default authorization grants
   *
   * @param {string} email The email address of the account owning person
   * @param {string} password The password of the account owning person
   * @param {string} optin If the account owner would like to receive notifications via email
   * @param {string} [isPublic] If the session created after create account is a public session
   * @param {Person} [person] Person attributes
   * @param {Place} [place] Place attributes
   * @return {Promise}
   */
  CreateAccount(email, password, optin, isPublic, person, place) {
    return Bridge.restfulRequest('account:CreateAccount', 'SERV:account:', {
      email,
      password,
      optin,
      isPublic,
      person,
      place,
    });
  },
};
