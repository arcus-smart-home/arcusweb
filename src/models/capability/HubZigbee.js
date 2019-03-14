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
 * @module {Object} i2web/models/HubZigbee HubZigbee
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function Reset
     *
     * Perform a reset of the Zigbee chip
     *
     * @param {enum} [type] The type of reset to be performed
     * @return {Promise}
     */
    Reset(type) {
      return Bridge.request('hubzigbee:Reset', this.GetDestination(), {
        type,
      });
    },
    /**
     * @function Scan
     *
     * Perform an environment scan using the Zigbee chip
     *
     * @return {Promise}
     */
    Scan() {
      return Bridge.request('hubzigbee:Scan', this.GetDestination(), {});
    },
    /**
     * @function GetConfig
     *
     * Get the Zigbee chip configuration information
     *
     * @return {Promise}
     */
    GetConfig() {
      return Bridge.request('hubzigbee:GetConfig', this.GetDestination(), {});
    },
    /**
     * @function GetStats
     *
     * Get the current low-level statistics tracked by the Zigbee chip
     *
     * @return {Promise}
     */
    GetStats() {
      return Bridge.request('hubzigbee:GetStats', this.GetDestination(), {});
    },
    /**
     * @function GetNodeDesc
     *
     * Get the node descriptor of a node in the Zigbee network
     *
     * @param {int} nwk The network address of the node.
     * @return {Promise}
     */
    GetNodeDesc(nwk) {
      return Bridge.request('hubzigbee:GetNodeDesc', this.GetDestination(), {
        nwk,
      });
    },
    /**
     * @function GetActiveEp
     *
     * Get the active endpoints of a node in the Zigbee network
     *
     * @param {int} nwk The network address of the node.
     * @return {Promise}
     */
    GetActiveEp(nwk) {
      return Bridge.request('hubzigbee:GetActiveEp', this.GetDestination(), {
        nwk,
      });
    },
    /**
     * @function GetSimpleDesc
     *
     * Get the simple descriptor of a node in the Zigbee network
     *
     * @param {int} nwk The network address of the node.
     * @param {int} ep The endpoint identifier on the node.
     * @return {Promise}
     */
    GetSimpleDesc(nwk, ep) {
      return Bridge.request('hubzigbee:GetSimpleDesc', this.GetDestination(), {
        nwk,
        ep,
      });
    },
    /**
     * @function GetPowerDesc
     *
     * Get the power descriptor of a node in the Zigbee network
     *
     * @param {int} nwk The network address of the node.
     * @return {Promise}
     */
    GetPowerDesc(nwk) {
      return Bridge.request('hubzigbee:GetPowerDesc', this.GetDestination(), {
        nwk,
      });
    },
    /**
     * @function Identify
     *
     * Identify a node in the Zigbee network
     *
     * @param {long} eui64 The network address of the node to be identified.
     * @param {int} duration The network address of the node to be identified.
     * @return {Promise}
     */
    Identify(eui64, duration) {
      return Bridge.request('hubzigbee:Identify', this.GetDestination(), {
        eui64,
        duration,
      });
    },
    /**
     * @function Remove
     *
     * Remove a node from the Zigbee network
     *
     * @param {long} eui64 The EUI64 of the node to be removed.
     * @return {Promise}
     */
    Remove(eui64) {
      return Bridge.request('hubzigbee:Remove', this.GetDestination(), {
        eui64,
      });
    },
    /**
     * @function FactoryReset
     *
     * Factory reset the Zigbee stack, removing all paired devices in the process.
     *
     * @return {Promise}
     */
    FactoryReset() {
      return Bridge.request('hubzigbee:FactoryReset', this.GetDestination(), {});
    },
    /**
     * @function FormNetwork
     *
     * Restore the Zigbee network to an exact state.
     *
     * @param {long} eui64 The eui64 to use for the restored hub
     * @param {int} panId The panid to use for the restored hub
     * @param {long} extPanId The extended panid to use for the restored hub
     * @param {int} channel The channel to use for the restored hub
     * @param {string} nwkkey The base64 encoded network key to use for the restored hub
     * @param {long} nwkfc The network frame counter to use for the restored hub
     * @param {long} apsfc The aps frame counter to use for the restored hub
     * @param {int} updateid The updateid to use for the restored hub
     * @return {Promise}
     */
    FormNetwork(eui64, panId, extPanId, channel, nwkkey, nwkfc, apsfc, updateid) {
      return Bridge.request('hubzigbee:FormNetwork', this.GetDestination(), {
        eui64,
        panId,
        extPanId,
        channel,
        nwkkey,
        nwkfc,
        apsfc,
        updateid,
      });
    },
    /**
     * @function FixMigration
     *
     * Run the migration fix proceedure
     *
     * @return {Promise}
     */
    FixMigration() {
      return Bridge.request('hubzigbee:FixMigration', this.GetDestination(), {});
    },
    /**
     * @function NetworkInformation
     *
     * Get information about the current state of the network.
     *
     * @return {Promise}
     */
    NetworkInformation() {
      return Bridge.request('hubzigbee:NetworkInformation', this.GetDestination(), {});
    },
    /**
     * @function PairingLinkKey
     *
     * Pairs a device using a pre-shared link key.
     *
     * @param {string} euid ASCII Hex encoded EUID of the device to pair.
     * @param {string} linkkey ASCII Hex encodeed preshared link key of the device to pair.
     * @param {long} timeout The amount of time in milliseconds for which the place will be able to add devices
     * @return {Promise}
     */
    PairingLinkKey(euid, linkkey, timeout) {
      return Bridge.request('hubzigbee:PairingLinkKey', this.GetDestination(), {
        euid,
        linkkey,
        timeout,
      });
    },
    /**
     * @function PairingInstallCode
     *
     * Pairs a device using a pre-shared install code.
     *
     * @param {string} euid ASCII Hex encoded EUID of the device to pair.
     * @param {string} installcode ASCII Hex encodeed install code of the device to pair.
     * @param {long} timeout The amount of time in milliseconds for which the place will be able to add devices
     * @return {Promise}
     */
    PairingInstallCode(euid, installcode, timeout) {
      return Bridge.request('hubzigbee:PairingInstallCode', this.GetDestination(), {
        euid,
        installcode,
        timeout,
      });
    },
    /**
     * @function ClearPendingPairing
     *
     * Clears out pending pairing devices.  Ineffects stops the background pairing for linked key devices.
     *
     * @return {Promise}
     */
    ClearPendingPairing() {
      return Bridge.request('hubzigbee:ClearPendingPairing', this.GetDestination(), {});
    },
  },
  events: {},
  POWERMODE_DEFAULT: 'DEFAULT',
  POWERMODE_BOOST: 'BOOST',
  POWERMODE_ALTERNATE: 'ALTERNATE',
  POWERMODE_BOOST_AND_ALTERNATE: 'BOOST_AND_ALTERNATE',
  STATE_UP: 'UP',
  STATE_DOWN: 'DOWN',
  STATE_JOIN_FAILED: 'JOIN_FAILED',
  STATE_MOVE_FAILED: 'MOVE_FAILED',
};
