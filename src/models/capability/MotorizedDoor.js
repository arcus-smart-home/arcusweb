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
 * @module {Object} i2web/models/MotorizedDoor MotorizedDoor
 * @parent app.models.capabilities
 *
 * Model of a motorized door, like a Garage Door with an opener.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} motdoor\:doorstate
     *
     * Current door state, and if written, desired door state.
     *
     */
    'motdoor:doorstate',
    /**
     * @property {int} motdoor\:doorlevel
     *
     * % open. 0 is closed, 100 is open.  Some doors do support reporting what level they are currently at, and some support a requested door level to leave a garage door at partial open.
     *
     */
    'motdoor:doorlevel',
  ],
  methods: {},
  events: {},
  DOORSTATE_CLOSED: 'CLOSED',
  DOORSTATE_CLOSING: 'CLOSING',
  DOORSTATE_OBSTRUCTION: 'OBSTRUCTION',
  DOORSTATE_OPENING: 'OPENING',
  DOORSTATE_OPEN: 'OPEN',
};
