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
 * @module {Object} i2web/models/Contact Contact
 * @parent app.models.capabilities
 *
 * Model of a contact sensor.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} cont\:usehint
     *
     * How the device should be treated for display to the user.  UNKNOWN indicates this value hasn&#x27;t been set and the user should be queried for how it was installed.  Some devices, such as door hinges, may populate this with an initial value of DOOR or WINDOW, but most drivers will initialize it to UNKNOWN
     *
     */
    'cont:usehint',
  ],
  methods: {},
  events: {},
  CONTACT_OPENED: 'OPENED',
  CONTACT_CLOSED: 'CLOSED',
  USEHINT_DOOR: 'DOOR',
  USEHINT_WINDOW: 'WINDOW',
  USEHINT_OTHER: 'OTHER',
  USEHINT_UNKNOWN: 'UNKNOWN',
};
