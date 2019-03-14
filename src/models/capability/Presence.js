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
 * @module {Object} i2web/models/Presence Presence
 * @parent app.models.capabilities
 *
 * Model of a Presence sensor.
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} pres\:person
     *
     * The address of the person currently associated with this presence detector
     *
     */
    'pres:person',
    /**
     * @property {enum} pres\:usehint
     *
     * What this presence detector is used for.  PERSON detects presence/absence of a person, OTHER something else (pet for example), UNKNOWN is unassigned.
     *
     */
    'pres:usehint',
  ],
  methods: {},
  events: {},
  PRESENCE_PRESENT: 'PRESENT',
  PRESENCE_ABSENT: 'ABSENT',
  USEHINT_UNKNOWN: 'UNKNOWN',
  USEHINT_PERSON: 'PERSON',
  USEHINT_OTHER: 'OTHER',
};
