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
 * @module {Object} i2web/models/IcstMessage IcstMessage
 * @parent app.models.capabilities
 *
 * Model of an ICST message
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} icstmsg\:messageType
     *
     * The type of message (MOTD, URGENT)
     *
     */
    'icstmsg:messageType',
    /**
     * @property {string} icstmsg\:message
     *
     * The message to be shared
     *
     */
    'icstmsg:message',
    /**
     * @property {set<string>} icstmsg\:recipients
     *
     * The set of recipients, or empty if all should see it
     *
     */
    'icstmsg:recipients',
    /**
     * @property {timestamp} icstmsg\:expiration
     *
     * The date the message expires (end-of-day), empty if URGENT or MOTD expires same day it was created
     *
     */
    'icstmsg:expiration',
  ],
  methods: {
    /**
     * @function CreateMessage
     *
     * Add a message
     *
     * @param {uuid} [id] unique id
     * @param {string} messageType MOTD or URGENT
     * @param {uuid} agent ID of agent that created the message
     * @param {string} message message to share
     * @param {set<string>} [recipients] empty or set of agent uuids
     * @param {timestamp} [expiration] The date the message expires (end-of-day), empty if URGENT or MOTD expires same day it was created.
     * @return {Promise}
     */
    CreateMessage(id, messageType, agent, message, recipients, expiration) {
      return Bridge.request('icstmsg:CreateMessage', this.GetDestination(), {
        id,
        messageType,
        agent,
        message,
        recipients,
        expiration,
      });
    },
    /**
     * @function ListMessagesForTimeframe
     *
     * Lists messages within a time range
     *
     * @param {string} messageType MOTD or URGENT
     * @param {uuid} [agent] empty or ID of agent for finding messages created by a particular agent
     * @param {string} startDate Earliest date for messages. Format is yyyy-MM-dd HH:mm:ss
     * @param {string} endDate Latest date for messages. Format is yyyy-MM-dd HH:mm:ss
     * @param {string} [token] token for paging results
     * @param {int} [limit] max 1000, default 50
     * @return {Promise}
     */
    ListMessagesForTimeframe(messageType, agent, startDate, endDate, token, limit) {
      return Bridge.request('icstmsg:ListMessagesForTimeframe', this.GetDestination(), {
        messageType,
        agent,
        startDate,
        endDate,
        token,
        limit,
      });
    },
  },
  events: {},

};
