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
 * @module {Object} i2web/models/CentraLiteSmartPlug CentraLiteSmartPlug
 * @parent app.models.capabilities
 *
 * Model for the Z-Wave side of the CentraLite.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function SetLearnMode
     *
     * Causes the Z-Wave side of the device to enter into learn mode for the specified duration.
     *
     * @return {Promise}
     */
    SetLearnMode() {
      return Bridge.request('centralitesmartplug:SetLearnMode', this.GetDestination(), {});
    },
    /**
     * @function SendNif
     *
     * Causes the Z-Wave side of the device to send a NIF frame.
     *
     * @return {Promise}
     */
    SendNif() {
      return Bridge.request('centralitesmartplug:SendNif', this.GetDestination(), {});
    },
    /**
     * @function Reset
     *
     * Causes the Z-Wave side of the device to reset.
     *
     * @return {Promise}
     */
    Reset() {
      return Bridge.request('centralitesmartplug:Reset', this.GetDestination(), {});
    },
    /**
     * @function Pair
     *
     * Attempt to pair the Z-Wave side of the device.
     *
     * @return {Promise}
     */
    Pair() {
      return Bridge.request('centralitesmartplug:Pair', this.GetDestination(), {});
    },
    /**
     * @function Query
     *
     * Attempt to determine the Z-Wave side node and home id.
     *
     * @return {Promise}
     */
    Query() {
      return Bridge.request('centralitesmartplug:Query', this.GetDestination(), {});
    },
  },
  events: {},

};
