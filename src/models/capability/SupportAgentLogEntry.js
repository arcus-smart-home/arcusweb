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
 * @module {Object} i2web/models/SupportAgentLogEntry SupportAgentLogEntry
 * @parent app.models.capabilities
 *
 * Model of an agent audit log entry
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function CreateAgentLogEntry
     *
     * Log something an agent did
     *
     * @param {uuid} agentId ID of agent
     * @param {uuid} accountId ID of account
     * @param {string} action what occurred
     * @param {set<string>} [parameters] set of parameters
     * @param {uuid} [userId] ID of customer
     * @param {uuid} [deviceId] ID of device
     * @param {uuid} [placeId] ID of place
     * @return {Promise}
     */
    CreateAgentLogEntry(agentId, accountId, action, parameters, userId, deviceId, placeId) {
      return Bridge.request('salogentry:CreateAgentLogEntry', this.GetDestination(), {
        agentId,
        accountId,
        action,
        parameters,
        userId,
        deviceId,
        placeId,
      });
    },
    /**
     * @function ListAgentLogEntries
     *
     * Lists audit logs within a time range
     *
     * @param {uuid} agentId ID of agent
     * @param {string} startDate Earliest date for logs. Format is yyyy-MM-dd HH:mm:ss
     * @param {string} endDate Latest date for logs. Format is yyyy-MM-dd HH:mm:ss
     * @return {Promise}
     */
    ListAgentLogEntries(agentId, startDate, endDate) {
      return Bridge.request('salogentry:ListAgentLogEntries', this.GetDestination(), {
        agentId,
        startDate,
        endDate,
      });
    },
  },
  events: {},

};
