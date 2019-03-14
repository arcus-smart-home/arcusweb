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
 * @module {Object} i2web/models/HubAV HubAV
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function pair
     *
     * Pair an AV device to the hub
     *
     * @param {string} uuid The UUID of the device.
     * @return {Promise}
     */
    pair(uuid) {
      return Bridge.request('hubav:pair', this.GetDestination(), {
        uuid,
      });
    },
    /**
     * @function release
     *
     * Release an AV device from the hub
     *
     * @param {string} uuid The UUID of the device.
     * @return {Promise}
     */
    release(uuid) {
      return Bridge.request('hubav:release', this.GetDestination(), {
        uuid,
      });
    },
    /**
     * @function getState
     *
     * Get current state of AV device
     *
     * @param {string} uuid The UUID of the device.
     * @return {Promise}
     */
    getState(uuid) {
      return Bridge.request('hubav:getState', this.GetDestination(), {
        uuid,
      });
    },
    /**
     * @function getIPAddress
     *
     * Get IPv4 address of AV device
     *
     * @param {string} uuid The UUID of the device.
     * @return {Promise}
     */
    getIPAddress(uuid) {
      return Bridge.request('hubav:getIPAddress', this.GetDestination(), {
        uuid,
      });
    },
    /**
     * @function getModel
     *
     * Get model of AV device
     *
     * @param {string} uuid The UUID of the device.
     * @return {Promise}
     */
    getModel(uuid) {
      return Bridge.request('hubav:getModel', this.GetDestination(), {
        uuid,
      });
    },
    /**
     * @function audioStart
     *
     * Start audio on an AV device given an URL
     *
     * @param {string} uuid The UUID of the device.
     * @param {string} [url] URL of media to play
     * @param {string} [metadata] Metadata of media to play
     * @return {Promise}
     */
    audioStart(uuid, url, metadata) {
      return Bridge.request('hubav:audioStart', this.GetDestination(), {
        uuid,
        url,
        metadata,
      });
    },
    /**
     * @function audioStop
     *
     * Stop audio on an AV device
     *
     * @param {string} uuid The UUID of the device.
     * @return {Promise}
     */
    audioStop(uuid) {
      return Bridge.request('hubav:audioStop', this.GetDestination(), {
        uuid,
      });
    },
    /**
     * @function audioPause
     *
     * Pause audio on an AV device
     *
     * @param {string} uuid The UUID of the device.
     * @return {Promise}
     */
    audioPause(uuid) {
      return Bridge.request('hubav:audioPause', this.GetDestination(), {
        uuid,
      });
    },
    /**
     * @function audioSeekTo
     *
     * Seek audio on an AV device
     *
     * @param {string} uuid The UUID of the device.
     * @param {enum} unit Seek mode of operation
     * @param {int} target The offset (in milliseconds) or track number.
     * @return {Promise}
     */
    audioSeekTo(uuid, unit, target) {
      return Bridge.request('hubav:audioSeekTo', this.GetDestination(), {
        uuid,
        unit,
        target,
      });
    },
    /**
     * @function setVolume
     *
     * Set volume on an AV device
     *
     * @param {string} uuid The UUID of the device.
     * @param {int} volume The volume, 0-100
     * @return {Promise}
     */
    setVolume(uuid, volume) {
      return Bridge.request('hubav:setVolume', this.GetDestination(), {
        uuid,
        volume,
      });
    },
    /**
     * @function getVolume
     *
     * Get volume on an AV device
     *
     * @param {string} uuid The UUID of the device.
     * @return {Promise}
     */
    getVolume(uuid) {
      return Bridge.request('hubav:getVolume', this.GetDestination(), {
        uuid,
      });
    },
    /**
     * @function setMute
     *
     * Set mute on an AV device
     *
     * @param {string} uuid The UUID of the device.
     * @param {boolean} mute The mute setting
     * @return {Promise}
     */
    setMute(uuid, mute) {
      return Bridge.request('hubav:setMute', this.GetDestination(), {
        uuid,
        mute,
      });
    },
    /**
     * @function getMute
     *
     * Get mute on an AV device
     *
     * @param {string} uuid The UUID of the device.
     * @return {Promise}
     */
    getMute(uuid) {
      return Bridge.request('hubav:getMute', this.GetDestination(), {
        uuid,
      });
    },
    /**
     * @function audioInfo
     *
     * Get information about current audio track
     *
     * @param {string} uuid The UUID of the device.
     * @return {Promise}
     */
    audioInfo(uuid) {
      return Bridge.request('hubav:audioInfo', this.GetDestination(), {
        uuid,
      });
    },
  },
  events: {
    /**
     * @function onAVDevicePairingStatus
     *
     * Sent when the status of an AV device pairing changes.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onAVDevicePairingStatus(callback) {
      Cornea.on('hubav hubav:AVDevicePairingStatus', callback);
    },
  },

};
