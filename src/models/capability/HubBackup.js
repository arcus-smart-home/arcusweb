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
 * @module {Object} i2web/models/HubBackup HubBackup
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function Backup
     *
     * Performs a backup in the hub, returning a binary blob in response.
     *
     * @param {enum} type The requested format of the backup data.
     * @return {Promise}
     */
    Backup(type) {
      return Bridge.request('hubbackup:Backup', this.GetDestination(), {
        type,
      });
    },
    /**
     * @function Restore
     *
     * Performs a restore on the hub.
     *
     * @param {enum} type The format of the backup data.
     * @param {string} data A Base 64 encoded binary blob.
     * @return {Promise}
     */
    Restore(type, data) {
      return Bridge.request('hubbackup:Restore', this.GetDestination(), {
        type,
        data,
      });
    },
  },
  events: {
    /**
     * @function onRestoreFinished
     *
     * An event indicating that the migration process has finished.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onRestoreFinished(callback) {
      Cornea.on('hubbackup hubbackup:RestoreFinished', callback);
    },
    /**
     * @function onRestoreProgress
     *
     * A progress report for migration.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onRestoreProgress(callback) {
      Cornea.on('hubbackup hubbackup:RestoreProgress', callback);
    },
  },

};
