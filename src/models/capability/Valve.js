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
 * @module {Object} i2web/models/Valve Valve
 * @parent app.models.capabilities
 *
 * Model of a valve.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} valv\:valvestate
     *
     * Reflects the current state of the valve. Obstruction implying that something is preventing the opening or closing of the valve. May also be used to set the state of the valve.
     *
     */
    'valv:valvestate',
  ],
  methods: {},
  events: {},
  VALVESTATE_CLOSED: 'CLOSED',
  VALVESTATE_OPEN: 'OPEN',
  VALVESTATE_OPENING: 'OPENING',
  VALVESTATE_CLOSING: 'CLOSING',
  VALVESTATE_OBSTRUCTION: 'OBSTRUCTION',
};
