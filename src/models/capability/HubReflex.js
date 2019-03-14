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
 * @module {Object} i2web/models/HubReflex HubReflex
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {},
  events: {
    /**
     * @function onSyncNeeded
     *
     * Event to indicate that the hub should sync devices with the platform.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onSyncNeeded(callback) {
      Cornea.on('hubrflx hubrflx:SyncNeeded', callback);
    },
  },

};
