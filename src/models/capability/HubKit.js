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
 * @module {Object} i2web/models/HubKit HubKit
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function SetKit
     *
     * Set the kit items for the hub.
     *
     * @param {enum} type Type of kit that this hub is a part of.
     * @param {list<ZigbeeLinkKeyedDevice>} devices List of devices in the kit that this hub is a part of.
     * @return {Promise}
     */
    SetKit(type, devices) {
      return Bridge.request('hubkit:SetKit', this.GetDestination(), {
        type,
        devices,
      });
    },
  },
  events: {},
  TYPE_NONE: 'NONE',
  TYPE_TEST: 'TEST',
  TYPE_PROMON: 'PROMON',
};
