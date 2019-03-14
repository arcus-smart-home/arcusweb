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
 * @module {Object} i2web/models/Scheduler Scheduler
 * @parent app.models.capabilities
 *
 * A scheduler associated with one target object (device, subsystem, etc).
The specific schedules for the device are multi-instance capabilities.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function FireCommand
     *
     * Fires the requested command right now, generally used for testing.
     *
     * @param {string} commandId The id of the command to fire
     * @return {Promise}
     */
    FireCommand(commandId) {
      return Bridge.request('scheduler:FireCommand', this.GetDestination(), {
        commandId,
      });
    },
    /**
     * @function AddWeeklySchedule
     *
     * Creates a new schedule which will appear as a new multi-instance object on the Scheduler with the given id.
If a schedule with the given id already exists with the same type this will be a no-op.  If a schedule with the same id and a different type exists, this will return an error.
     *
     * @param {string} id The instance id of the schedule to create.
     * @param {string} [group] Default: id. The group to associate this schedule with, when not specified the id will be used.
     * @return {Promise}
     */
    AddWeeklySchedule(id, group) {
      return Bridge.request('scheduler:AddWeeklySchedule', this.GetDestination(), {
        id,
        group,
      });
    },
    /**
     * @function Delete
     *
     * Deletes this scheduler object and all associated schedules, this is generally not recommended.  If the target object is deleted, this Scheduler will automatically be deleted.
     *
     * @return {Promise}
     */
    Delete() {
      return Bridge.request('scheduler:Delete', this.GetDestination(), {});
    },
  },
  events: {},

};
