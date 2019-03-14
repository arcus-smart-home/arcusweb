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
 * @module {Object} i2web/models/LeakH2O LeakH2O
 * @parent app.models.capabilities
 *
 * Model of a leak detection sensor.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} leakh2o\:state
     *
     * Reflects the state of the leak detector.
     *
     */
    'leakh2o:state',
  ],
  methods: {
    /**
     * @function leakh2o
     *
     * @param {string} state
     * @return {Promise}
     */
    leakh2o(state) {
      return Bridge.request('leakh2o:leakh2o', this.GetDestination(), {
        state,
      });
    },
  },
  events: {},
  STATE_SAFE: 'SAFE',
  STATE_LEAK: 'LEAK',
};
