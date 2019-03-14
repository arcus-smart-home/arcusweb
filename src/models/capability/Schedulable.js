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
 * @module {Object} i2web/models/Schedulable Schedulable
 * @parent app.models.capabilities
 *
 * Capability for denoting what type of scheduling a device supports.  To maintain backwards
compatibility before this capability was added, any device that is typically schedulable should
be considered as such when this capability is not present.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function EnableSchedule
     *
     * Enables scheduling for this device
     *
     * @return {Promise}
     */
    EnableSchedule() {
      return Bridge.request('schedulable:EnableSchedule', this.GetDestination(), {});
    },
    /**
     * @function DisableSchedule
     *
     * Disables scheduling for this device
     *
     * @return {Promise}
     */
    DisableSchedule() {
      return Bridge.request('schedulable:DisableSchedule', this.GetDestination(), {});
    },
  },
  events: {},
  TYPE_NOT_SUPPORTED: 'NOT_SUPPORTED',
  TYPE_DEVICE_ONLY: 'DEVICE_ONLY',
  TYPE_DRIVER_READ_ONLY: 'DRIVER_READ_ONLY',
  TYPE_DRIVER_WRITE_ONLY: 'DRIVER_WRITE_ONLY',
  TYPE_SUPPORTED_DRIVER: 'SUPPORTED_DRIVER',
  TYPE_SUPPORTED_CLOUD: 'SUPPORTED_CLOUD',
};
