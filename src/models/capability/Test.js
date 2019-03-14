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

import Cornea from 'i2web/cornea/';

/**
 * @module {Object} i2web/models/Test Test
 * @parent app.models.capabilities
 *
 * This capability is used for devices which support a test mode.  Generally text/instructions will be associated with the device in the device repository that will let the user know when they should press a test button (or something similar) in order to emit the test event.
 */
export default {
  writeableAttributes: [],
  methods: {},
  events: {
    /**
     * @function onTest
     *
     * Emitted when the test button or other test procedure is executed.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onTest(callback) {
      Cornea.on('test test:Test', callback);
    },
  },

};
