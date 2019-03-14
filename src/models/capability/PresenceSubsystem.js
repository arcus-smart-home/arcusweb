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
 * @module {Object} i2web/models/PresenceSubsystem PresenceSubsystem
 * @parent app.models.capabilities
 *
 * Presence detection subsystem.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function GetPresenceAnalysis
     *
     * Presence analysis describes, for each person, whether the subsystem thinks the person is at home or not and how it came to that conclusion.
     *
     * @return {Promise}
     */
    GetPresenceAnalysis() {
      return Bridge.request('subspres:GetPresenceAnalysis', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onArrived
     *
     * Sent when a person or device becomes present.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onArrived(callback) {
      Cornea.on('subspres subspres:Arrived', callback);
    },
    /**
     * @function onDeparted
     *
     * Sent when a person or device devices.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeparted(callback) {
      Cornea.on('subspres subspres:Departed', callback);
    },
    /**
     * @function onPersonArrived
     *
     * Sent when a presence device associated with a person becomes present.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPersonArrived(callback) {
      Cornea.on('subspres subspres:PersonArrived', callback);
    },
    /**
     * @function onPersonDeparted
     *
     * Sent when a presence device associated with a person becomes absent
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPersonDeparted(callback) {
      Cornea.on('subspres subspres:PersonDeparted', callback);
    },
    /**
     * @function onDeviceArrived
     *
     * Sent when a presence device associated with a place becomes present.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeviceArrived(callback) {
      Cornea.on('subspres subspres:DeviceArrived', callback);
    },
    /**
     * @function onDeviceDeparted
     *
     * Sent when a presence device associated with a place becomes absent
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeviceDeparted(callback) {
      Cornea.on('subspres subspres:DeviceDeparted', callback);
    },
    /**
     * @function onDeviceAssignedToPerson
     *
     * Sent when a presence device is associated with a person
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeviceAssignedToPerson(callback) {
      Cornea.on('subspres subspres:DeviceAssignedToPerson', callback);
    },
    /**
     * @function onDeviceUnassignedFromPerson
     *
     * Sent when a presence device is unassociated with a person
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDeviceUnassignedFromPerson(callback) {
      Cornea.on('subspres subspres:DeviceUnassignedFromPerson', callback);
    },
    /**
     * @function onPlaceOccupied
     *
     * Sent when at least one presence device assigned to people is present
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPlaceOccupied(callback) {
      Cornea.on('subspres subspres:PlaceOccupied', callback);
    },
    /**
     * @function onPlaceUnoccupied
     *
     * Sent when all presence device assigned to people are absent
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPlaceUnoccupied(callback) {
      Cornea.on('subspres subspres:PlaceUnoccupied', callback);
    },
  },

};
