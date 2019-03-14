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
 * @module {Object} i2web/models/HubButton HubButton
 * @parent app.models.capabilities
 *
 * Arcus button on the top of the V3 hub.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} hubbutton\:state
     *
     * Reflects the current state of the button where pressed implies the user has pressed the button and released the opposite. Also used to set the state of the button.
     *
     */
    'hubbutton:state',
  ],
  methods: {},
  events: {},
  STATE_RELEASED: 'RELEASED',
  STATE_PRESSED: 'PRESSED',
  STATE_DOUBLE_PRESSED: 'DOUBLE_PRESSED',
};
