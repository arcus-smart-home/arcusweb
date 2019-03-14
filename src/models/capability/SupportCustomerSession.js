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
 * @module {Object} i2web/models/SupportCustomerSession SupportCustomerSession
 * @parent app.models.capabilities
 *
 * Support agent session
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} suppcustsession\:url
     *
     * The last known URL for the session.
     *
     */
    'suppcustsession:url',
    /**
     * @property {uuid} suppcustsession\:place
     *
     * The current place in the session
     *
     */
    'suppcustsession:place',
    /**
     * @property {set<string>} suppcustsession\:notes
     *
     * Notes taken by the agent during the session
     *
     */
    'suppcustsession:notes',
  ],
  methods: {
    /**
     * @function StartSession
     *
     * Create a support customer session
     *
     * @param {uuid} agent Agent UUID
     * @param {uuid} account Account UUID
     * @param {uuid} caller caller UUID
     * @param {string} origin Origin of session (inbound, outbound, email)
     * @return {Promise}
     */
    StartSession(agent, account, caller, origin) {
      return Bridge.request('suppcustsession:StartSession', this.GetDestination(), {
        agent,
        account,
        caller,
        origin,
      });
    },
    /**
     * @function FindActiveSession
     *
     * Find the active support customer session (if any) by account id and agent id
     *
     * @param {uuid} agent Agent UUID
     * @param {uuid} account Account UUID
     * @return {Promise}
     */
    FindActiveSession(agent, account) {
      return Bridge.request('suppcustsession:FindActiveSession', this.GetDestination(), {
        agent,
        account,
      });
    },
    /**
     * @function ListSessions
     *
     * Find all support customer sessions for an account (active and closed) by account id
     *
     * @param {uuid} account Account UUID
     * @return {Promise}
     */
    ListSessions(account) {
      return Bridge.request('suppcustsession:ListSessions', this.GetDestination(), {
        account,
      });
    },
    /**
     * @function CloseSession
     *
     * Closes a session
     *
     * @return {Promise}
     */
    CloseSession() {
      return Bridge.request('suppcustsession:CloseSession', this.GetDestination(), {});
    },
  },
  events: {},

};
