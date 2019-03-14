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
 * @module {Object} i2web/models/DeviceConnection DeviceConnection
 * @parent app.models.capabilities
 *
 * Model of a device&#x27;s connection to the platform.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function LostDevice
     *
     * Sent when a device exists on the platform but is not reported by the hub.
     *
     * @return {Promise}
     */
    LostDevice() {
      return Bridge.request('devconn:LostDevice', this.GetDestination(), {});
    },
  },
  events: {},
  STATE_ONLINE: 'ONLINE',
  STATE_OFFLINE: 'OFFLINE',
  STATUS_ONLINE: 'ONLINE',
  STATUS_FLAPPING: 'FLAPPING',
  STATUS_LOST: 'LOST',
};
