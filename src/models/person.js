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
 * @module {canMap} i2web/models/person Person
 * @parent app.models
 *
 * Model of a person.
 */
import { ModelConnection } from './base';
import 'can-map-define';
import 'can-construct-super';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import makeCloneable from 'i2web/connections/cloneable';
import PersonCapability from 'i2web/models/capability/Person';
import AppState from 'i2web/plugins/get-app-state';

const Person = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} i2web/models/person.static.metadata metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/person.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'person',
    destination: 'SERV:{namespace}:{base:id}',
  },
}, {
  init() {
    this._super();
    if (!this.attr('base:caps')) {
      this.mixin(PersonCapability);
    }

    // ITWO-11422 - cleanup mobile numbers that aren't prefixed correctly
    // temporary change until platform implementation is completed
    if (this.hasOwnProperty('person:mobileNumber')) {
      let mobileNumber = this.attr('person:mobileNumber');
      while (mobileNumber && mobileNumber.length && !['(', '2', '3', '4', '5', '6', '7', '8', '9'].includes(mobileNumber[0])) {
        const trimmedNumber = mobileNumber.substring(1);
        this.attr('person:mobileNumber', trimmedNumber);
        mobileNumber = trimmedNumber;
      }
    }
  },
  define: {
    /**
     * @property {Object} icon
     * @parent i2web/models/person
     *
     * The icon of the person and whether it is a class or a URL
     */
    icon: {
      get() {
        // Fixed value for release 1.0
        return {
          type: 'icon',
          value: 'icon-app-user-1',
        };
      },
    },
    'person:name': {
      get() {
        return `${this.attr('person:firstName') || ''}${this.attr('person:firstName') && this.attr('person:lastName') ? ' ' : ''}${this.attr('person:lastName') || ''}`;
      },
    },
    'web:person:isOwner': {
      get() {
        const account = AppState().attr('account');
        if (account) {
          return this.attr('base:id') === account.attr('account:owner');
        }
        return false;
      },
    },
    /**
     * @property {String} web:person:primaryPlaceId
     * @parent i2web/models/person.properties
     * If defined, indicates the primary place of the person
     */
    'web:person:primaryPlaceId': {
      type: 'string',
    },
  },
  /**
   * @function getPlaceRole
   *
   * Method to get the person's role with an associated place by the place's ID.
   *
   * @return {String}
   */
  getPlaceRole(placeId) {
    return this.attr(`web:role:${placeId}`);
  },
});

export const PersonConnection = ModelConnection('person', 'base:address', Person);
Person.connection = PersonConnection;
makeCloneable(Person);

export default Person;
