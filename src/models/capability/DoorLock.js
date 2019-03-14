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
 * @module {Object} i2web/models/DoorLock DoorLock
 * @parent app.models.capabilities
 *
 * Model of a door lock.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} doorlock\:lockstate
     *
     * Reflects the state of the lock mechanism.
     *
     */
    'doorlock:lockstate',
  ],
  methods: {
    /**
     * @function AuthorizePerson
     *
     * Authorizes a person on this lock by adding the person&#x27;s pin on the lock and returns the slot ID used
     *
     * @param {uuid} personId The ID of the person to add to the lock
     * @return {Promise}
     */
    AuthorizePerson(personId) {
      return Bridge.request('doorlock:AuthorizePerson', this.GetDestination(), {
        personId,
      });
    },
    /**
     * @function DeauthorizePerson
     *
     * Remove the pin for the given user from the lock and sets the slot state to UNUSED
     *
     * @param {uuid} personId The ID of the person to remove from the lock
     * @return {Promise}
     */
    DeauthorizePerson(personId) {
      return Bridge.request('doorlock:DeauthorizePerson', this.GetDestination(), {
        personId,
      });
    },
    /**
     * @function BuzzIn
     *
     * Temporarily unlock the lock if locked.  Automatically relock in 30 seconds.
     *
     * @return {Promise}
     */
    BuzzIn() {
      return Bridge.request('doorlock:BuzzIn', this.GetDestination(), {});
    },
    /**
     * @function ClearAllPins
     *
     * Clear all the pins currently set in the lock.
     *
     * @return {Promise}
     */
    ClearAllPins() {
      return Bridge.request('doorlock:ClearAllPins', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onInvalidPin
     *
     * If the driver supports it this will be emitted when an invalid pin is entered
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onInvalidPin(callback) {
      Cornea.on('doorlock doorlock:InvalidPin', callback);
    },
    /**
     * @function onPinUsed
     *
     * Fired when a pin is used to lock or unlock the lock
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPinUsed(callback) {
      Cornea.on('doorlock doorlock:PinUsed', callback);
    },
    /**
     * @function onPinAddedAtLock
     *
     * Fired when a pin is added manually at the lock.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPinAddedAtLock(callback) {
      Cornea.on('doorlock doorlock:PinAddedAtLock', callback);
    },
    /**
     * @function onPinRemovedAtLock
     *
     * Fired when a pin is removed manually at the lock.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPinRemovedAtLock(callback) {
      Cornea.on('doorlock doorlock:PinRemovedAtLock', callback);
    },
    /**
     * @function onPinChangedAtLock
     *
     * Fired when a pin is changed manually at the lock.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPinChangedAtLock(callback) {
      Cornea.on('doorlock doorlock:PinChangedAtLock', callback);
    },
    /**
     * @function onPersonAuthorized
     *
     * Emitted when the driver receives a report that a person has been provisioned on the device
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPersonAuthorized(callback) {
      Cornea.on('doorlock doorlock:PersonAuthorized', callback);
    },
    /**
     * @function onPersonDeauthorized
     *
     * Emitted when the driver receives a report that a person has been deprovisioned from the device
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPersonDeauthorized(callback) {
      Cornea.on('doorlock doorlock:PersonDeauthorized', callback);
    },
    /**
     * @function onPinOperationFailed
     *
     * Emitted when the driver receives report that a person&#x27;s PIN operation failed on the device
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPinOperationFailed(callback) {
      Cornea.on('doorlock doorlock:PinOperationFailed', callback);
    },
    /**
     * @function onAllPinsCleared
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onAllPinsCleared(callback) {
      Cornea.on('doorlock doorlock:AllPinsCleared', callback);
    },
    /**
     * @function onClearAllPinsFailed
     *
     * Emitted when the drivers receives a failure clearing the pins or fails to recieve confirmation
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onClearAllPinsFailed(callback) {
      Cornea.on('doorlock doorlock:ClearAllPinsFailed', callback);
    },
  },
  LOCKSTATE_LOCKED: 'LOCKED',
  LOCKSTATE_UNLOCKED: 'UNLOCKED',
  LOCKSTATE_LOCKING: 'LOCKING',
  LOCKSTATE_UNLOCKING: 'UNLOCKING',
  TYPE_DEADBOLT: 'DEADBOLT',
  TYPE_LEVERLOCK: 'LEVERLOCK',
  TYPE_OTHER: 'OTHER',
};
