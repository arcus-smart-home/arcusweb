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
 * @module {Object} i2web/models/Hub4g Hub4g
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function GetInfo
     *
     * Get 4G dongle information
     *
     * @return {Promise}
     */
    GetInfo() {
      return Bridge.request('hub4g:GetInfo', this.GetDestination(), {});
    },
    /**
     * @function ResetStatistics
     *
     * Reset 4g connection statistics
     *
     * @return {Promise}
     */
    ResetStatistics() {
      return Bridge.request('hub4g:ResetStatistics', this.GetDestination(), {});
    },
    /**
     * @function GetStatistics
     *
     * Get 4g connection statistics
     *
     * @return {Promise}
     */
    GetStatistics() {
      return Bridge.request('hub4g:GetStatistics', this.GetDestination(), {});
    },
  },
  events: {},
  CONNECTIONSTATE_CONNECTING: 'CONNECTING',
  CONNECTIONSTATE_CONNECTED: 'CONNECTED',
  CONNECTIONSTATE_DISCONNECTING: 'DISCONNECTING',
  CONNECTIONSTATE_DISCONNECTED: 'DISCONNECTED',
};
