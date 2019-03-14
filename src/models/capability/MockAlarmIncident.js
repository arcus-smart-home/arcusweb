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
 * @module {Object} i2web/models/MockAlarmIncident MockAlarmIncident
 * @parent app.models.capabilities
 *
 * Model of a mock alarm incident
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function Contacted
     *
     * Throws an error if the current incidentState is not alertState: ALERT or alertState: CANCELLING.
Adds the history entry for contacting a person.  If no person is specified the person issuing the call will be used.
     *
     * @param {String} person The address of the person to contact
     * @return {Promise}
     */
    Contacted(person) {
      return Bridge.request('incidentmock:Contacted', this.GetDestination(), {
        person,
      });
    },
    /**
     * @function DispatchCancelled
     *
     * Throws an error if the current incidentState is not alertState: ALERT or alertState: CANCELLING.
Sets the monitoringState to CANCELLED and the alertState to COMPLETE.  Also creates the appropriate history entries.
If no person is specified the person issuing the call will be used.
     *
     * @param {String} person The address of the person to contact
     * @return {Promise}
     */
    DispatchCancelled(person) {
      return Bridge.request('incidentmock:DispatchCancelled', this.GetDestination(), {
        person,
      });
    },
    /**
     * @function DispatchAccepted
     *
     * Throws an error if the current incidentState is not alertState: ALERT or alertState: CANCELLING.
Sets the monitoringState to DISPATCHED and creates the appropriate history entries.
If the alertState is CANCELLING it should be changed to COMPLETE.
     *
     * @param {enum} authority The authority for the incident incident.
     * @return {Promise}
     */
    DispatchAccepted(authority) {
      return Bridge.request('incidentmock:DispatchAccepted', this.GetDestination(), {
        authority,
      });
    },
    /**
     * @function DispatchRefused
     *
     * Throws an error if the current incidentState is not alertState: ALERT or alertState: CANCELLING.
Sets the monitoringState to DISPATCHED and creates the appropriate history entries.
If the alertState is CANCELLING it should be changed to COMPLETE.
     *
     * @param {enum} authority The authority for the incident incident.
     * @return {Promise}
     */
    DispatchRefused(authority) {
      return Bridge.request('incidentmock:DispatchRefused', this.GetDestination(), {
        authority,
      });
    },
  },
  events: {},

};
