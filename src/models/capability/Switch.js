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
 * @module {Object} i2web/models/Switch Switch
 * @parent app.models.capabilities
 *
 * Model of a switch.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} swit\:state
     *
     * Reflects the state of the switch. Also used to set the state of the switch.
     *
     */
    'swit:state',
    /**
     * @property {boolean} swit\:inverted
     *
     * Indicates whether operation of the physical switch toggle should be inverted, if supported.
     *
     */
    'swit:inverted',
  ],
  methods: {},
  events: {},
  STATE_ON: 'ON',
  STATE_OFF: 'OFF',
};
