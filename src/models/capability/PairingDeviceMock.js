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
 * @module {Object} i2web/models/PairingDeviceMock PairingDeviceMock
 * @parent app.models.capabilities
 *
 * A mock for testing different pairing states
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function UpdatePairingPhase
     *
     * Updates the pairing phase, does not allow the mock to &#x27;go backwards&#x27;
     *
     * @param {enum} [phase] The phase to set the mock to, or empty / null to progress to the next logical phase for the given type of device.
     * @return {Promise}
     */
    UpdatePairingPhase(phase) {
      return Bridge.request('pairdevmock:UpdatePairingPhase', this.GetDestination(), {
        phase,
      });
    },
  },
  events: {},

};
