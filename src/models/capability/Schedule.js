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

/**
 * @module {Object} i2web/models/Schedule Schedule
 * @parent app.models.capabilities
 *
 * A schedule is a set of commands and when they are run. In general these
appear as multi-instance capabilities on a Scheduler.
 */
export default {
  writeableAttributes: [
    /**
     * @property {boolean} sched\:enabled
     *
     * Whether or not this scheduled is currently enabled to run.  When disabled no scheduled commands will be sent.
     *
     */
    'sched:enabled',
  ],
  methods: {
    /**
     * @function Delete
     *
     * Deletes this Schedule and removes any scheduled commands.
     *
     * @return {Promise}
     */
    Delete() {
      return Bridge.request('sched:Delete', this.GetDestination(), {});
    },
    /**
     * @function DeleteCommand
     *
     * Deletes any occurrences of the scheduled command from this Schedule.
     *
     * @param {string} commandId The id of the command to delete.
     * @return {Promise}
     */
    DeleteCommand(commandId) {
      return Bridge.request('sched:DeleteCommand', this.GetDestination(), {
        commandId,
      });
    },
  },
  events: {},

};
