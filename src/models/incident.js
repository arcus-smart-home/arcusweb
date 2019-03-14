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

/**
 * @module {canMap} i2web/models/incident Incident
 * @parent app.models
 *
 * Model of an incident.
 */
import 'can-construct-super';
import { ModelConnection } from './base';
import 'can-map-define';
import canList from 'can-list';
import getAppState from 'i2web/plugins/get-app-state';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import Errors from 'i2web/plugins/errors';
import IncidentCapability from 'i2web/models/capability/AlarmIncident';
import _uniqWith from 'lodash/uniqWith';

const Incident = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} i2web/models/incident.static.metadata metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/incident.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'incident',
    destination: 'SERV:{namespace}:{base:id}',
  },
}, {
  define: {
    /**
     * @property {boolean} _retrievedHistory
     * @parent i2web/models/incident
     * @description Whether we have retrieved historical events or not
     */
    _retrievedHistory: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {canList} _events
     * @parent i2web/models/incident
     * @description Non de-duped history events list
     */
    _events: {
      value() {
        const events = new canList([]);
        // sort entries by timestamp DESC
        events.attr('comparator', (a, b) => {
          return a.timestamp > b.timestamp ? -1 : 1;
        });
        return events;
      },
      get(currentValue) {
        if (!this.attr('_retrievedHistory')) {
          this._getEventsRecursive(null);
        }
        return currentValue;
      },
    },
    /**
     * @property {canList} web:events
     * @parent i2web/models/incident
     * @description De-duped history events list
     */
    'web:events': {
      get() {
        this.attr('_events').attr('length');
        return _uniqWith(this.attr('_events'), (a, b) => {
          return a.attr('timestamp') === b.attr('timestamp') && a.attr('subjectAddress') === b.attr('subjectAddress');
        });
      },
    },
  },
  /**
   * @function _getEventsRecursive
   * @parent i2web/models/incident
   * @param {string} token
   * @return {Promise}
   * @description Gets history events recursively
   */
  _getEventsRecursive(token) {
    this.attr('_retrievedHistory', true);
    return this.ListHistoryEntries(100, token).then((results) => {
      this.attr('_events').push(...results.results);
      if (results.nextToken) {
        this.getEventsRecursive(100, results.nextToken);
      }
    }).catch((e) => {
      Errors.log(e);
    });
  },
  init() {
    this._super(arguments);

    // set up a Cornea listener to push any incoming history events onto this incident's history list
    IncidentCapability.events.onHistoryAdded((incidentHistoryEntry) => {
      if (incidentHistoryEntry['base:address'] === this.attr('base:address')) {
        this.attr('_events').splice(0, 0, ...incidentHistoryEntry.events);
      }
    });
  },
});
const idProp = 'base:address';

export const IncidentConnection = ModelConnection('incident', 'base:address', Incident);

function setCurrentIncident(data) {
  const id = data[idProp];
  if (IncidentConnection.instanceStore.get(id)) {
    getAppState().setCurrentIncident(id);
  }
}
IncidentCapability.events.onSecurityAlert(data => setCurrentIncident(data));
IncidentCapability.events.onCOAlert(data => setCurrentIncident(data));
IncidentCapability.events.onSmokeAlert(data => setCurrentIncident(data));
IncidentCapability.events.onPanicAlert(data => setCurrentIncident(data));
IncidentCapability.events.onWaterAlert(data => setCurrentIncident(data));

export default Incident;
