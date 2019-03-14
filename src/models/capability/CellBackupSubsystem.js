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

import Cornea from 'i2web/cornea/';

/**
 * @module {Object} i2web/models/CellBackupSubsystem CellBackupSubsystem
 * @parent app.models.capabilities
 *
 * Cell Backup Subsystem
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function Ban
     *
     * Sets status &#x3D; ERRORED, errorState &#x3D; BANNED so that the hub bridge will not auth this hub if it connects via cellular.
     *
     * @return {Promise}
     */
    Ban() {
      return Bridge.request('cellbackup:Ban', this.GetDestination(), {});
    },
    /**
     * @function Unban
     *
     * Resets status to best-choice [READY, ACTIVE, NOTREADY] and sets errorState to NONE
     *
     * @return {Promise}
     */
    Unban() {
      return Bridge.request('cellbackup:Unban', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onCellAccessBanned
     *
     * Event emitted from the subsystem to the hub-bridges to boot the hub if it is currently connected by cell backup
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onCellAccessBanned(callback) {
      Cornea.on('cellbackup cellbackup:CellAccessBanned', callback);
    },
    /**
     * @function onCellAccessUnbanned
     *
     * Event emitted from the subsystem to the hub-bridges to boot the hub if it is currently connected by cell backup
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onCellAccessUnbanned(callback) {
      Cornea.on('cellbackup cellbackup:CellAccessUnbanned', callback);
    },
  },
  STATUS_READY: 'READY',
  STATUS_ACTIVE: 'ACTIVE',
  STATUS_NOTREADY: 'NOTREADY',
  STATUS_ERRORED: 'ERRORED',
  ERRORSTATE_NONE: 'NONE',
  ERRORSTATE_NOSIM: 'NOSIM',
  ERRORSTATE_NOTPROVISIONED: 'NOTPROVISIONED',
  ERRORSTATE_DISABLED: 'DISABLED',
  ERRORSTATE_BANNED: 'BANNED',
  ERRORSTATE_OTHER: 'OTHER',
  NOTREADYSTATE_NEEDSSUB: 'NEEDSSUB',
  NOTREADYSTATE_NEEDSMODEM: 'NEEDSMODEM',
  NOTREADYSTATE_BOTH: 'BOTH',
};
