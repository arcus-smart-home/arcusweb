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
 * @module {Object} i2web/models/HubSercomm HubSercomm
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function getCameraPassword
     *
     * Get camera password for hub
     *
     * @return {Promise}
     */
    getCameraPassword() {
      return Bridge.request('hubsercomm:getCameraPassword', this.GetDestination(), {});
    },
    /**
     * @function pair
     *
     * Pair a camera to the hub
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    pair(mac) {
      return Bridge.request('hubsercomm:pair', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function reset
     *
     * Reset a camera back to factory defaults
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    reset(mac) {
      return Bridge.request('hubsercomm:reset', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function reboot
     *
     * Reboot a camera
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    reboot(mac) {
      return Bridge.request('hubsercomm:reboot', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function config
     *
     * Configure a camera
     *
     * @param {string} mac The MAC address of the camera.
     * @param {string} params Parameters to set on camera
     * @return {Promise}
     */
    config(mac, params) {
      return Bridge.request('hubsercomm:config', this.GetDestination(), {
        mac,
        params,
      });
    },
    /**
     * @function upgrade
     *
     * Upgrade firmware on camera
     *
     * @param {string} mac The MAC address of the camera.
     * @param {string} url URL of firmware image to install
     * @return {Promise}
     */
    upgrade(mac, url) {
      return Bridge.request('hubsercomm:upgrade', this.GetDestination(), {
        mac,
        url,
      });
    },
    /**
     * @function getState
     *
     * Get current state of camera
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    getState(mac) {
      return Bridge.request('hubsercomm:getState', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function getVersion
     *
     * Get current firmware version on camera
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    getVersion(mac) {
      return Bridge.request('hubsercomm:getVersion', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function getDayNight
     *
     * Get current day/night setting of camera
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    getDayNight(mac) {
      return Bridge.request('hubsercomm:getDayNight', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function getIPAddress
     *
     * Get IPv4 address of camera
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    getIPAddress(mac) {
      return Bridge.request('hubsercomm:getIPAddress', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function getModel
     *
     * Get model of camera
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    getModel(mac) {
      return Bridge.request('hubsercomm:getModel', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function getInfo
     *
     * Get camera information and configuration
     *
     * @param {string} mac The MAC address of the camera.
     * @param {string} [group] The parameter group for camera configuration.
     * @return {Promise}
     */
    getInfo(mac, group) {
      return Bridge.request('hubsercomm:getInfo', this.GetDestination(), {
        mac,
        group,
      });
    },
    /**
     * @function getAttrs
     *
     * Get camera attributes
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    getAttrs(mac) {
      return Bridge.request('hubsercomm:getAttrs', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function motionDetectStart
     *
     * Start motion detection on camera.
     *
     * @param {string} mac The MAC address of the camera.
     * @param {string} url The URL to post to when motion occurs.
     * @param {string} [username] The HTTP username for the post URL.
     * @param {string} [password] The HTTP password for the post URL.
     * @return {Promise}
     */
    motionDetectStart(mac, url, username, password) {
      return Bridge.request('hubsercomm:motionDetectStart', this.GetDestination(), {
        mac,
        url,
        username,
        password,
      });
    },
    /**
     * @function motionDetectStop
     *
     * Stop motion detection on a camera.
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    motionDetectStop(mac) {
      return Bridge.request('hubsercomm:motionDetectStop', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function videoStreamStart
     *
     * Start video streaming on camera.
     *
     * @param {string} mac The MAC address of the camera.
     * @param {string} address The address of the video server.
     * @param {string} username The HTTP username for the post URL.
     * @param {string} password The HTTP password for the post URL.
     * @param {int} [duration] The duration of the video streaming.
     * @param {int} [precapture] The pre-capture video setting.
     * @param {int} [format] The video streaming format.
     * @param {int} [resolution] The video resolution.
     * @param {int} [quality_type] The video quality type.
     * @param {int} [bitrate] The video bitrate.
     * @param {int} [quality] The video quality.
     * @param {int} [framerate] The video framerate.
     * @return {Promise}
     */
    videoStreamStart(mac, address, username, password, duration, precapture, format, resolution, qualityType, bitrate, quality, framerate) {
      return Bridge.request('hubsercomm:videoStreamStart', this.GetDestination(), {
        mac,
        address,
        username,
        password,
        duration,
        precapture,
        format,
        resolution,
        qualityType,
        bitrate,
        quality,
        framerate,
      });
    },
    /**
     * @function videoStreamStop
     *
     * Stop video streaming on a camera.
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    videoStreamStop(mac) {
      return Bridge.request('hubsercomm:videoStreamStop', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function wifiScanStart
     *
     * Start scan for wireless access points
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    wifiScanStart(mac) {
      return Bridge.request('hubsercomm:wifiScanStart', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function wifiScanEnd
     *
     * End scan for wireless access points
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    wifiScanEnd(mac) {
      return Bridge.request('hubsercomm:wifiScanEnd', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function wifiConnect
     *
     * Connect to a wireless network
     *
     * @param {string} mac The MAC address of the camera.
     * @param {string} ssid The ssid of the wireless network.
     * @param {string} security The security type of the wireless network.
     * @param {string} [key] The authentication key of the wireless network.
     * @return {Promise}
     */
    wifiConnect(mac, ssid, security, key) {
      return Bridge.request('hubsercomm:wifiConnect', this.GetDestination(), {
        mac,
        ssid,
        security,
        key,
      });
    },
    /**
     * @function wifiDisconnect
     *
     * Disconnect from a wireless network.
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    wifiDisconnect(mac) {
      return Bridge.request('hubsercomm:wifiDisconnect', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function wifiGetAttrs
     *
     * Get current wireless attributes
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    wifiGetAttrs(mac) {
      return Bridge.request('hubsercomm:wifiGetAttrs', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function getCustomAttrs
     *
     * Get camera custom attributes
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    getCustomAttrs(mac) {
      return Bridge.request('hubsercomm:getCustomAttrs', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function setCustomAttrs
     *
     * Set camera custom attributes
     *
     * @param {string} mac The MAC address of the camera.
     * @param {enum} irLedMode The IR LED mode
     * @param {int} [irLedLuminance] The IR LED luminance, on a scale of 1 to 5.
     * @param {enum} [mdMode] The motion detection mode of operation.
     * @param {int} [mdThreshold] The motion detection threshold, on a scale of 0 to 255.
     * @param {int} [mdSensitivity] The motion detection threshold, on a scale of 0 to 10.
     * @param {string} [mdWindowCoordinates] The motion detection window in X1,Y1,X2,Y2 format.
     * @return {Promise}
     */
    setCustomAttrs(mac, irLedMode, irLedLuminance, mdMode, mdThreshold, mdSensitivity, mdWindowCoordinates) {
      return Bridge.request('hubsercomm:setCustomAttrs', this.GetDestination(), {
        mac,
        irLedMode,
        irLedLuminance,
        mdMode,
        mdThreshold,
        mdSensitivity,
        mdWindowCoordinates,
      });
    },
    /**
     * @function purgeCamera
     *
     * Remove camera from database, remove if necessary
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    purgeCamera(mac) {
      return Bridge.request('hubsercomm:purgeCamera', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function ptzGetAttrs
     *
     * Get camera Pan/Tilt/Zoom attributes
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    ptzGetAttrs(mac) {
      return Bridge.request('hubsercomm:ptzGetAttrs', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function ptzGotoHome
     *
     * Move camera to home position
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    ptzGotoHome(mac) {
      return Bridge.request('hubsercomm:ptzGotoHome', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function ptzGotoAbsolute
     *
     * Move camera to absolute position
     *
     * @param {string} mac The MAC address of the camera.
     * @param {int} pan The pan position for the camera.
     * @param {int} tilt The tilt position for the camera.
     * @param {int} zoom The zoom position for the camera.
     * @return {Promise}
     */
    ptzGotoAbsolute(mac, pan, tilt, zoom) {
      return Bridge.request('hubsercomm:ptzGotoAbsolute', this.GetDestination(), {
        mac,
        pan,
        tilt,
        zoom,
      });
    },
    /**
     * @function ptzGotoRelative
     *
     * Move camera to relative position
     *
     * @param {string} mac The MAC address of the camera.
     * @param {int} deltaPan The pan delta for the camera.
     * @param {int} deltaTilt The tilt delta for the camera.
     * @param {int} deltaZoom The zoom delta for the camera.
     * @return {Promise}
     */
    ptzGotoRelative(mac, deltaPan, deltaTilt, deltaZoom) {
      return Bridge.request('hubsercomm:ptzGotoRelative', this.GetDestination(), {
        mac,
        deltaPan,
        deltaTilt,
        deltaZoom,
      });
    },
    /**
     * @function getAudioAttrs
     *
     * Get camera audio attributes
     *
     * @param {string} mac The MAC address of the camera.
     * @return {Promise}
     */
    getAudioAttrs(mac) {
      return Bridge.request('hubsercomm:getAudioAttrs', this.GetDestination(), {
        mac,
      });
    },
    /**
     * @function setAudioAttrs
     *
     * Set camera audio attributes
     *
     * @param {string} mac The MAC address of the camera.
     * @param {enum} inputMode The audio input mode
     * @return {Promise}
     */
    setAudioAttrs(mac, inputMode) {
      return Bridge.request('hubsercomm:setAudioAttrs', this.GetDestination(), {
        mac,
        inputMode,
      });
    },
  },
  events: {
    /**
     * @function onCameraUpgradeStatus
     *
     * Sent when the status of a camera firmware upgrade changes.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onCameraUpgradeStatus(callback) {
      Cornea.on('hubsercomm hubsercomm:CameraUpgradeStatus', callback);
    },
    /**
     * @function onCameraPairingStatus
     *
     * Sent when the status of a camera pairing changes.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onCameraPairingStatus(callback) {
      Cornea.on('hubsercomm hubsercomm:CameraPairingStatus', callback);
    },
    /**
     * @function onWifiScanResults
     *
     * Results of wireless access point scan.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onWifiScanResults(callback) {
      Cornea.on('hubsercomm hubsercomm:WifiScanResults', callback);
    },
  },

};
