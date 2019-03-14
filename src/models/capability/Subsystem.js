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
 * @module {Object} i2web/models/Subsystem Subsystem
 * @parent app.models.capabilities
 *
 * Base attributes and methods for subsystems
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function Activate
     *
     * Puts the subsystem into an &#x27;active&#x27; state, this only applies to previously suspended subsystems, see Place#AddSubsystem(subsystemType: String) for adding new subsystems to a place.
     *
     * @return {Promise}
     */
    Activate() {
      return Bridge.request('subs:Activate', this.GetDestination(), {});
    },
    /**
     * @function Suspend
     *
     * Puts the subsystem into a &#x27;suspended&#x27; state.
     *
     * @return {Promise}
     */
    Suspend() {
      return Bridge.request('subs:Suspend', this.GetDestination(), {});
    },
    /**
     * @function Delete
     *
     * Removes the subsystem and all data from the associated place.
     *
     * @return {Promise}
     */
    Delete() {
      return Bridge.request('subs:Delete', this.GetDestination(), {});
    },
    /**
     * @function ListHistoryEntries
     *
     * Returns a list of all the history log entries associated with this subsystem
     *
     * @param {int} [limit] The maximum number of events to return (defaults to 10)
     * @param {string} [token] The token from a previous query to use for retrieving the next set of results
     * @param {boolean} [includeIncidents] Whether or not incidents should be included in history, defaults to false for backwards compatibility
     * @return {Promise}
     */
    ListHistoryEntries(limit, token, includeIncidents) {
      return Bridge.request('subs:ListHistoryEntries', this.GetDestination(), {
        limit,
        token,
        includeIncidents,
      });
    },
  },
  events: {},
  STATE_ACTIVE: 'ACTIVE',
  STATE_SUSPENDED: 'SUSPENDED',
};
