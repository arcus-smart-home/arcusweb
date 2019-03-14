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
 * @module {Object} i2web/models/Camera Camera
 * @parent app.models.capabilities
 *
 * Model of a Camera indication on a device.
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} camera\:resolution
     *
     * Current resolution of the camera. Must appear in resolutionssupported list.
     *
     */
    'camera:resolution',
    /**
     * @property {enum} camera\:bitratetype
     *
     * Constant bit rate or variable bit rate
     *
     */
    'camera:bitratetype',
    /**
     * @property {string} camera\:bitrate
     *
     * Only valid when bitrate type is cbr. Must appear in bitratessupported list.
     *
     */
    'camera:bitrate',
    /**
     * @property {string} camera\:quality
     *
     * Current quality of the camera. Must appear in qualitiessupported list.
     *
     */
    'camera:quality',
    /**
     * @property {int} camera\:framerate
     *
     * Current framerate of the camera. Must be minframerate &lt;&#x3D; framerate &lt;&#x3D; maxframerate
     *
     */
    'camera:framerate',
    /**
     * @property {boolean} camera\:flip
     *
     * When true, camera&#x27;s image is flipped vertically
     *
     */
    'camera:flip',
    /**
     * @property {boolean} camera\:mirror
     *
     * When true, camera&#x27;s image is mirrored horizontally
     *
     */
    'camera:mirror',
    /**
     * @property {enum} camera\:irLedMode
     *
     * Reflects the mode of IR LED on the camera.
     *
     */
    'camera:irLedMode',
    /**
     * @property {int} camera\:irLedLuminance
     *
     * Reflects the current IR LED luminance, on a scale of 1 to 5.
     *
     */
    'camera:irLedLuminance',
  ],
  methods: {
    /**
     * @function StartStreaming
     *
     * Informs the camera to start streaming to some destination
     *
     * @param {string} url The url to stream to
     * @param {string} username The username to authenticate with
     * @param {string} password The password to authenticate with
     * @param {int} maxDuration The maximum time in seconds to stream
     * @param {boolean} [stream] True if a live stream is being started, false otherwise.  This is for drivers where the streaming method is different from the live streaming method.  Drivers that treat these the same may ignore this attributes.  If not provided assume false.
     * @return {Promise}
     */
    StartStreaming(url, username, password, maxDuration, stream) {
      return Bridge.request('camera:StartStreaming', this.GetDestination(), {
        url,
        username,
        password,
        maxDuration,
        stream,
      });
    },
  },
  events: {},
  BITRATETYPE_CBR: 'cbr',
  BITRATETYPE_VBR: 'vbr',
  IRLEDMODE_ON: 'ON',
  IRLEDMODE_OFF: 'OFF',
  IRLEDMODE_AUTO: 'AUTO',
};
