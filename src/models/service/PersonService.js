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
 * @module {Object} i2web/models/PersonService PersonService
 * @parent app.models.services
 *
 * Entry points for global operations on the people.
 */
export default {
  /**
   * @function SendPasswordReset
   *
   * Requests the platform to generate a password reset token and notify the user
   *
   * @param {string} email The email address of the person
   * @param {enum} method The method by which the user will be notified of their reset token
   * @return {Promise}
   */
  SendPasswordReset(email, method) {
    return Bridge.restfulRequest('person:SendPasswordReset', 'SERV:person:', {
      email,
      method,
    });
  },
  /**
   * @function ResetPassword
   *
   * Resets the users password
   *
   * @param {string} email The email address of the person
   * @param {string} token The token the user received via email or ivr
   * @param {string} password The new password
   * @return {Promise}
   */
  ResetPassword(email, token, password) {
    return Bridge.restfulRequest('person:ResetPassword', 'SERV:person:', {
      email,
      token,
      password,
    });
  },
  /**
   * @function ChangePassword
   *
   * Changes the password for the given person
   *
   * @param {string} currentPassword Users current password
   * @param {string} newPassword Users new password
   * @param {string} [emailAddress] Users Email Address
   * @return {Promise}
   */
  ChangePassword(currentPassword, newPassword, emailAddress) {
    return Bridge.restfulRequest('person:ChangePassword', 'SERV:person:', {
      currentPassword,
      newPassword,
      emailAddress,
    });
  },
};
