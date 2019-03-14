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
 * @module {Object} i2web/models/Bridge Bridge
 * @parent app.models.capabilities
 *
 * Model of a bridge device used to manage instances of other devices.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function StartPairing
     *
     * Puts bridge into pairing mode for timeout seconds.  Any devices seen while not in pairing mode will be immediately paired as well as any new devices discovered within the timeout period
     *
     * @param {long} timeout Amount of time that the bridge device will stay in pairing mode in milliseconds.
     * @return {Promise}
     */
    StartPairing(timeout) {
      return Bridge.request('bridge:StartPairing', this.GetDestination(), {
        timeout,
      });
    },
    /**
     * @function StopPairing
     *
     * Removes the bridge from pairing mode.
     *
     * @return {Promise}
     */
    StopPairing() {
      return Bridge.request('bridge:StopPairing', this.GetDestination(), {});
    },
  },
  events: {},
  PAIRINGSTATE_PAIRING: 'PAIRING',
  PAIRINGSTATE_UNPAIRING: 'UNPAIRING',
  PAIRINGSTATE_IDLE: 'IDLE',
};
