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
 * @module {Object} i2web/models/InvitationService InvitationService
 * @parent app.models.services
 *
 * Static services related to invitations
 */
export default {
  /**
   * @function GetInvitation
   *
   * Finds an invitation by its code and invitee email
   *
   * @param {string} code The invitation code
   * @param {string} inviteeEmail The email address the invite was sent too
   * @return {Promise}
   */
  GetInvitation(code, inviteeEmail) {
    return Bridge.restfulRequest('invite:GetInvitation', 'SERV:invite:', {
      code,
      inviteeEmail,
    });
  },
  /**
   * @function AcceptInvitationCreateLogin
   *
   * Creates a new person/login and associates them with the place from the invitation
   *
   * @param {Person} person The person you would like to create with person to this place.
   * @param {string} password The login password for this person.
   * @param {string} code The invitation code
   * @param {string} inviteeEmail The email the invitation was sent to, which does nto have to be same as the email the login is created with.
   * @return {Promise}
   */
  AcceptInvitationCreateLogin(person, password, code, inviteeEmail) {
    return Bridge.restfulRequest('invite:AcceptInvitationCreateLogin', 'SERV:invite:', {
      person,
      password,
      code,
      inviteeEmail,
    });
  },
};
