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
 * @module {Object} i2web/models/DeviceMock DeviceMock
 * @parent app.models.capabilities
 *
 * Represents a mock device used for testing.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function SetAttributes
     *
     * Sets the attributes on the mock device
     *
     * @param {map<any>} attrs Attributes to set on the device
     * @return {Promise}
     */
    SetAttributes(attrs) {
      return Bridge.request('devmock:SetAttributes', this.GetDestination(), {
        attrs,
      });
    },
    /**
     * @function Connect
     *
     * Causes the device to connect
     *
     * @return {Promise}
     */
    Connect() {
      return Bridge.request('devmock:Connect', this.GetDestination(), {});
    },
    /**
     * @function Disconnect
     *
     * Causes the device to disconnect
     *
     * @return {Promise}
     */
    Disconnect() {
      return Bridge.request('devmock:Disconnect', this.GetDestination(), {});
    },
  },
  events: {},

};
