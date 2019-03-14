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
 * @module {Object} i2web/models/DoorsNLocksSubsystem DoorsNLocksSubsystem
 * @parent app.models.capabilities
 *
 * Doors &amp; Locks Subsystem
 */
export default {
  writeableAttributes: [
    /**
     * @property {set<DoorChimeConfig>} subdoorsnlocks\:chimeConfig
     *
     * The set of all that could have a chiming enabled/disabled.
     *
     */
    'subdoorsnlocks:chimeConfig',
  ],
  methods: {
    /**
     * @function AuthorizePeople
     *
     * Authorizes the given people on the lock.  Any people that previously existed on the lock not in this set will be deauthorized
     *
     * @param {String} device The address of the door lock to disassociate/associate people with
     * @param {list<LockAuthorizationOperation>} operations The set of people to assign to the door lock
     * @return {Promise}
     */
    AuthorizePeople(device, operations) {
      return Bridge.request('subdoorsnlocks:AuthorizePeople', this.GetDestination(), {
        device,
        operations,
      });
    },
    /**
     * @function SynchAuthorization
     *
     * Synchronizes the access on the device and the service, by clearing all pins and reassociating people that should have access
     *
     * @param {String} device The address of the device to synchronize
     * @return {Promise}
     */
    SynchAuthorization(device) {
      return Bridge.request('subdoorsnlocks:SynchAuthorization', this.GetDestination(), {
        device,
      });
    },
  },
  events: {
    /**
     * @function onPersonAuthorized
     *
     * Emitted from the subsystem when a person is authorized on a lock
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPersonAuthorized(callback) {
      Cornea.on('subdoorsnlocks subdoorsnlocks:PersonAuthorized', callback);
    },
    /**
     * @function onPersonDeauthorized
     *
     * Emitted from the subsystem when a person is deauthorized from a lock
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPersonDeauthorized(callback) {
      Cornea.on('subdoorsnlocks subdoorsnlocks:PersonDeauthorized', callback);
    },
    /**
     * @function onLockJammed
     *
     * Emitted when a door lock is jammed.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onLockJammed(callback) {
      Cornea.on('subdoorsnlocks subdoorsnlocks:LockJammed', callback);
    },
    /**
     * @function onLockUnjammed
     *
     * Emitted when a door lock is no longer jammed.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onLockUnjammed(callback) {
      Cornea.on('subdoorsnlocks subdoorsnlocks:LockUnjammed', callback);
    },
    /**
     * @function onMotorizedDoorObstructed
     *
     * Emitted when a motorized door is obstructed.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onMotorizedDoorObstructed(callback) {
      Cornea.on('subdoorsnlocks subdoorsnlocks:MotorizedDoorObstructed', callback);
    },
    /**
     * @function onMotorizedDoorUnobstructed
     *
     * Emitted when a motorized door is no longer obstructed.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onMotorizedDoorUnobstructed(callback) {
      Cornea.on('subdoorsnlocks subdoorsnlocks:MotorizedDoorUnobstructed', callback);
    },
  },

};
