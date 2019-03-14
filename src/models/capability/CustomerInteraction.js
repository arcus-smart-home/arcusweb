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
 * @module {Object} i2web/models/CustomerInteraction CustomerInteraction
 * @parent app.models.capabilities
 *
 * Model of a customer interaction
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} suppcustinteraction\:action
     *
     * The action that happened
     *
     */
    'suppcustinteraction:action',
    /**
     * @property {string} suppcustinteraction\:comment
     *
     * The comment entered about the interaction
     *
     */
    'suppcustinteraction:comment',
    /**
     * @property {string} suppcustinteraction\:concessions
     *
     * The concessions that were given
     *
     */
    'suppcustinteraction:concessions',
    /**
     * @property {string} suppcustinteraction\:incidentNumber
     *
     * The incident number entered about the interaction
     *
     */
    'suppcustinteraction:incidentNumber',
  ],
  methods: {
    /**
     * @function CreateInteraction
     *
     * Add an interaction
     *
     * @param {uuid} [id] unique id
     * @param {uuid} account ID of account
     * @param {uuid} place ID of place
     * @param {uuid} customer ID of customer
     * @param {uuid} agent ID of agent
     * @param {string} action what occurred
     * @param {string} comment agent comment
     * @param {string} [concessions] agent concessions
     * @param {timestamp} accountCreated account created date
     * @param {string} serviceLevel place service level
     * @param {string} [incidentNumber] incident number
     * @param {list<ProblemDevice>} [problemDevices] list of problem devices
     * @return {Promise}
     */
    CreateInteraction(id, account, place, customer, agent, action, comment, concessions, accountCreated, serviceLevel, incidentNumber, problemDevices) {
      return Bridge.request('suppcustinteraction:CreateInteraction', this.GetDestination(), {
        id,
        account,
        place,
        customer,
        agent,
        action,
        comment,
        concessions,
        accountCreated,
        serviceLevel,
        incidentNumber,
        problemDevices,
      });
    },
    /**
     * @function UpdateInteraction
     *
     * update an interaction
     *
     * @param {uuid} id unique id
     * @param {uuid} account ID of account
     * @param {uuid} place ID of place
     * @param {uuid} customer ID of customer
     * @param {uuid} agent ID of agent
     * @param {string} action what occurred
     * @param {string} comment agent comment
     * @param {string} [concessions] agent concessions
     * @param {string} [incidentNumber] incident number
     * @param {timestamp} created created
     * @return {Promise}
     */
    UpdateInteraction(id, account, place, customer, agent, action, comment, concessions, incidentNumber, created) {
      return Bridge.request('suppcustinteraction:UpdateInteraction', this.GetDestination(), {
        id,
        account,
        place,
        customer,
        agent,
        action,
        comment,
        concessions,
        incidentNumber,
        created,
      });
    },
    /**
     * @function ListInteractions
     *
     * Lists interactions within a time range
     *
     * @param {uuid} account ID of account
     * @param {uuid} place ID of place
     * @param {string} startDate Earliest date for interactions. Format is yyyy-MM-dd HH:mm:ss
     * @param {string} endDate Latest date for interactions. Format is yyyy-MM-dd HH:mm:ss
     * @return {Promise}
     */
    ListInteractions(account, place, startDate, endDate) {
      return Bridge.request('suppcustinteraction:ListInteractions', this.GetDestination(), {
        account,
        place,
        startDate,
        endDate,
      });
    },
    /**
     * @function ListInteractionsForTimeframe
     *
     * Lists interactions within a time range across accounts and places
     *
     * @param {list<string>} [filter] array of actions to retrieve interactions for
     * @param {string} startDate Earliest date for interactions. Format is yyyy-MM-dd HH:mm:ss
     * @param {string} endDate Latest date for interactions. Format is yyyy-MM-dd HH:mm:ss
     * @param {string} [token] token for paging results
     * @param {int} [limit] max 1000, default 50
     * @return {Promise}
     */
    ListInteractionsForTimeframe(filter, startDate, endDate, token, limit) {
      return Bridge.request('suppcustinteraction:ListInteractionsForTimeframe', this.GetDestination(), {
        filter,
        startDate,
        endDate,
        token,
        limit,
      });
    },
  },
  events: {},

};
