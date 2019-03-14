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

import Cornea from 'i2web/cornea/';

/**
 * @module {Object} i2web/models/PetDoor PetDoor
 * @parent app.models.capabilities
 *
 * Model of a pet door.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} petdoor\:lockstate
     *
     * Lock state of the door, to override the doorlock lockstate.
     *
     */
    'petdoor:lockstate',
  ],
  methods: {
    /**
     * @function RemoveToken
     *
     * Remove a pet token from the pet door to prevent further access.
     *
     * @param {int} tokenId The ID of the token to remove from the pet door
     * @return {Promise}
     */
    RemoveToken(tokenId) {
      return Bridge.request('petdoor:RemoveToken', this.GetDestination(), {
        tokenId,
      });
    },
  },
  events: {
    /**
     * @function onTokenAdded
     *
     * Fired when a pet token is added to the pet door.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onTokenAdded(callback) {
      Cornea.on('petdoor petdoor:TokenAdded', callback);
    },
    /**
     * @function onTokenRemoved
     *
     * Fired when a pet token is removed from the pet door.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onTokenRemoved(callback) {
      Cornea.on('petdoor petdoor:TokenRemoved', callback);
    },
    /**
     * @function onTokenUsed
     *
     * Fired when a token is used to unlock the pet door.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onTokenUsed(callback) {
      Cornea.on('petdoor petdoor:TokenUsed', callback);
    },
  },
  LOCKSTATE_LOCKED: 'LOCKED',
  LOCKSTATE_UNLOCKED: 'UNLOCKED',
  LOCKSTATE_AUTO: 'AUTO',
  DIRECTION_IN: 'IN',
  DIRECTION_OUT: 'OUT',
};
