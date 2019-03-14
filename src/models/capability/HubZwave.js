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
 * @module {Object} i2web/models/HubZwave HubZwave
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [
    /**
     * @property {boolean} hubzwave\:healRecommended
     *
     * True if a heal should be run on the network to restore proper operation.
     *
     */
    'hubzwave:healRecommended',
  ],
  methods: {
    /**
     * @function FactoryReset
     *
     * Clears out the ZWave controller, effectively unpairing all devices.  Will also change the zwave chip&#x27;s home id.
     *
     * @return {Promise}
     */
    FactoryReset() {
      return Bridge.request('hubzwave:FactoryReset', this.GetDestination(), {});
    },
    /**
     * @function Reset
     *
     * Perform a reset of the Z-Wave chip
     *
     * @param {enum} [type] The type of reset to be performed
     * @return {Promise}
     */
    Reset(type) {
      return Bridge.request('hubzwave:Reset', this.GetDestination(), {
        type,
      });
    },
    /**
     * @function ForcePrimary
     *
     * Forces the Z-Wave chip into the primary controller role.
     *
     * @return {Promise}
     */
    ForcePrimary() {
      return Bridge.request('hubzwave:ForcePrimary', this.GetDestination(), {});
    },
    /**
     * @function ForceSecondary
     *
     * Forces the Z-Wave chip into the secondary controller role.
     *
     * @return {Promise}
     */
    ForceSecondary() {
      return Bridge.request('hubzwave:ForceSecondary', this.GetDestination(), {});
    },
    /**
     * @function NetworkInformation
     *
     * Get information about the current state of the network.
     *
     * @return {Promise}
     */
    NetworkInformation() {
      return Bridge.request('hubzwave:NetworkInformation', this.GetDestination(), {});
    },
    /**
     * @function Heal
     *
     * Performs a network wide heal of the Z-Wave network. WARNING: This interferes with normal operation of the Z-Wave controller for the duration of the healing process.
     *
     * @param {boolean} [block] True if the network optimization process to block control of Z-Wave devices.
     * @param {timestamp} [time] The time at which the network wide heal should be run (null or java epoch mean immediately)
     * @return {Promise}
     */
    Heal(block, time) {
      return Bridge.request('hubzwave:Heal', this.GetDestination(), {
        block,
        time,
      });
    },
    /**
     * @function CancelHeal
     *
     * Cancels any Z-Wave network heal that might be in progress.
     *
     * @return {Promise}
     */
    CancelHeal() {
      return Bridge.request('hubzwave:CancelHeal', this.GetDestination(), {});
    },
    /**
     * @function RemoveZombie
     *
     * Attempts to remove a zombie node from the Z-Wave chip&#x27;s node list.
     *
     * @param {int} node The node id of the node to remove. This node must be zombie.
     * @return {Promise}
     */
    RemoveZombie(node) {
      return Bridge.request('hubzwave:RemoveZombie', this.GetDestination(), {
        node,
      });
    },
    /**
     * @function Associate
     *
     * Attempts to associate with a node using the given groups.
     *
     * @param {int} node The node id of the node to associate with.
     * @param {set<int>} groups The set of groups to associate with.
     * @return {Promise}
     */
    Associate(node, groups) {
      return Bridge.request('hubzwave:Associate', this.GetDestination(), {
        node,
        groups,
      });
    },
    /**
     * @function AssignReturnRoutes
     *
     * Attempts to re-assign return routes to a node.
     *
     * @param {int} node The node id of the node to associate with.
     * @return {Promise}
     */
    AssignReturnRoutes(node) {
      return Bridge.request('hubzwave:AssignReturnRoutes', this.GetDestination(), {
        node,
      });
    },
  },
  events: {
    /**
     * @function onHealComplete
     *
     * Indicates that the requested Z-Wave network heal operation has completed.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onHealComplete(callback) {
      Cornea.on('hubzwave hubzwave:HealComplete', callback);
    },
  },
  STATE_INIT: 'INIT',
  STATE_NORMAL: 'NORMAL',
  STATE_PAIRING: 'PAIRING',
  STATE_UNPAIRING: 'UNPAIRING',
  HEALFINISHREASON_SUCCESS: 'SUCCESS',
  HEALFINISHREASON_CANCEL: 'CANCEL',
  HEALFINISHREASON_TERMINATED: 'TERMINATED',
};
