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
 * @module {Object} i2web/models/SupportAgent SupportAgent
 * @parent app.models.capabilities
 *
 * Model of a support agent
 */
export default {
  writeableAttributes: [
    /**
     * @property {timestamp} supportagent\:modified
     *
     * The date the agent was last modified
     *
     */
    'supportagent:modified',
    /**
     * @property {string} supportagent\:state
     *
     * The state of the agent
     *
     */
    'supportagent:state',
    /**
     * @property {string} supportagent\:firstName
     *
     * First name of the agent
     *
     */
    'supportagent:firstName',
    /**
     * @property {string} supportagent\:lastName
     *
     * Last name of the agent
     *
     */
    'supportagent:lastName',
    /**
     * @property {string} supportagent\:email
     *
     * The email address for the agent
     *
     */
    'supportagent:email',
    /**
     * @property {timestamp} supportagent\:emailVerified
     *
     * The date the email was verified
     *
     */
    'supportagent:emailVerified',
    /**
     * @property {string} supportagent\:mobileNumber
     *
     * The mobile phone number for the agent
     *
     */
    'supportagent:mobileNumber',
    /**
     * @property {timestamp} supportagent\:mobileVerified
     *
     * The date the mobile phone number was verified
     *
     */
    'supportagent:mobileVerified',
    /**
     * @property {string} supportagent\:supportTier
     *
     * The support tier for the agent
     *
     */
    'supportagent:supportTier',
    /**
     * @property {string} supportagent\:currLocation
     *
     * The support center the agent belongs to
     *
     */
    'supportagent:currLocation',
    /**
     * @property {string} supportagent\:currLocationTimeZone
     *
     * The time zone the support center is located in
     *
     */
    'supportagent:currLocationTimeZone',
    /**
     * @property {list<string>} supportagent\:mobileNotificationEndpoints
     *
     * The list of mobile endpoints where notifications may be sent
     *
     */
    'supportagent:mobileNotificationEndpoints',
  ],
  methods: {
    /**
     * @function ListAgents
     *
     * Lists all agents
     *
     * @return {Promise}
     */
    ListAgents() {
      return Bridge.request('supportagent:ListAgents', this.GetDestination(), {});
    },
    /**
     * @function CreateSupportAgent
     *
     * Create a support agent
     *
     * @param {string} email Email address of the agent
     * @param {string} firstName First name of the agent
     * @param {string} lastName Last name of the agent
     * @param {string} supportTier Support tier of the agent
     * @param {string} [password] Password of the agent
     * @param {string} [mobileNumber] Mobile number of the agent
     * @param {string} [currLocation] Location of the agent
     * @param {string} [currLocationTimeZone] Location of the agent
     * @return {Promise}
     */
    CreateSupportAgent(email, firstName, lastName, supportTier, password, mobileNumber, currLocation, currLocationTimeZone) {
      return Bridge.request('supportagent:CreateSupportAgent', this.GetDestination(), {
        email,
        firstName,
        lastName,
        supportTier,
        password,
        mobileNumber,
        currLocation,
        currLocationTimeZone,
      });
    },
    /**
     * @function FindAgentById
     *
     * Find a support agent by their id
     *
     * @return {Promise}
     */
    FindAgentById() {
      return Bridge.request('supportagent:FindAgentById', this.GetDestination(), {});
    },
    /**
     * @function FindAgentByEmail
     *
     * Find a support agent by their email address
     *
     * @param {string} email Email address of the agent
     * @return {Promise}
     */
    FindAgentByEmail(email) {
      return Bridge.request('supportagent:FindAgentByEmail', this.GetDestination(), {
        email,
      });
    },
    /**
     * @function DeleteAgent
     *
     * Removes an agent
     *
     * @return {Promise}
     */
    DeleteAgent() {
      return Bridge.request('supportagent:DeleteAgent', this.GetDestination(), {});
    },
    /**
     * @function LockAgent
     *
     * Manually locks an agent, keeping them from logging in
     *
     * @return {Promise}
     */
    LockAgent() {
      return Bridge.request('supportagent:LockAgent', this.GetDestination(), {});
    },
    /**
     * @function UnlockAgent
     *
     * Unlocks an agent, allowing them to login
     *
     * @return {Promise}
     */
    UnlockAgent() {
      return Bridge.request('supportagent:UnlockAgent', this.GetDestination(), {});
    },
    /**
     * @function ResetAgentPassword
     *
     * Resets an agent&#x27;s password
     *
     * @param {string} email Email address of the agent
     * @param {string} newPassword New password for the agent
     * @return {Promise}
     */
    ResetAgentPassword(email, newPassword) {
      return Bridge.request('supportagent:ResetAgentPassword', this.GetDestination(), {
        email,
        newPassword,
      });
    },
    /**
     * @function EditPreferences
     *
     * allows inserts and updates of user preferences
     *
     * @param {string} email Email address of the agent
     * @param {map<string>} prefValues preference valuse
     * @return {Promise}
     */
    EditPreferences(email, prefValues) {
      return Bridge.request('supportagent:EditPreferences', this.GetDestination(), {
        email,
        prefValues,
      });
    },
  },
  events: {},

};
