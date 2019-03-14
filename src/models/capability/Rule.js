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
 * @module {Object} i2web/models/Rule Rule
 * @parent app.models.capabilities
 *
 * Model of a rule, which is a specific instance of a RuleTemplate with context necessary for evaluation
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} rule\:name
     *
     * The name of the rule
     *
     */
    'rule:name',
    /**
     * @property {string} rule\:description
     *
     * User provided description of the rule
     *
     */
    'rule:description',
  ],
  methods: {
    /**
     * @function Enable
     *
     * Enables the rule if it is disabled
     *
     * @return {Promise}
     */
    Enable() {
      return Bridge.request('rule:Enable', this.GetDestination(), {});
    },
    /**
     * @function Disable
     *
     * Disables the rule if it is enabled
     *
     * @return {Promise}
     */
    Disable() {
      return Bridge.request('rule:Disable', this.GetDestination(), {});
    },
    /**
     * @function UpdateContext
     *
     * Updates the context for the rule
     *
     * @param {Object} [context] New context values to update
     * @param {string} [template] New template identifier to update
     * @return {Promise}
     */
    UpdateContext(context, template) {
      return Bridge.request('rule:UpdateContext', this.GetDestination(), {
        context,
        template,
      });
    },
    /**
     * @function Delete
     *
     * Deletes the rule
     *
     * @return {Promise}
     */
    Delete() {
      return Bridge.request('rule:Delete', this.GetDestination(), {});
    },
    /**
     * @function ListHistoryEntries
     *
     * Returns a list of all the history log entries associated with this rule
     *
     * @param {int} [limit] The maximum number of events to return (defaults to 10)
     * @param {string} [token] The token from a previous query to use for retrieving the next set of results
     * @return {Promise}
     */
    ListHistoryEntries(limit, token) {
      return Bridge.request('rule:ListHistoryEntries', this.GetDestination(), {
        limit,
        token,
      });
    },
  },
  events: {},
  STATE_ENABLED: 'ENABLED',
  STATE_DISABLED: 'DISABLED',
};
