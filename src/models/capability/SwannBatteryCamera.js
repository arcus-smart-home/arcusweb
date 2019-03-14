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
 * @module {Object} i2web/models/SwannBatteryCamera SwannBatteryCamera
 * @parent app.models.capabilities
 *
 * Additional functionality for battery Swann battery cameras.
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} swannbatterycamera\:timeZone
     *
     * Offset from GMT in 30m increments
     *
     */
    'swannbatterycamera:timeZone',
    /**
     * @property {enum} swannbatterycamera\:motionDetectSleep
     *
     * How long to sleep between motion detection.
     *
     */
    'swannbatterycamera:motionDetectSleep',
    /**
     * @property {boolean} swannbatterycamera\:stopUpload
     *
     * true to prevent the camera from upload clips, false otherwise.
     *
     */
    'swannbatterycamera:stopUpload',
  ],
  methods: {
    /**
     * @function KeepAwake
     *
     * Wakes up the battery camera if it is asleep and tell it to stay awake for the given number of seconds.  If the camera is already awake, this will tell the camera to stay awake for the given number of seconds
     *
     * @param {int} seconds The number of seconds to keep the camera awake
     * @return {Promise}
     */
    KeepAwake(seconds) {
      return Bridge.request('swannbatterycamera:KeepAwake', this.GetDestination(), {
        seconds,
      });
    },
  },
  events: {},
  MODE_WLAN_CONFIGURE: 'WLAN_CONFIGURE',
  MODE_WLAN_RECONNECT: 'WLAN_RECONNECT',
  MODE_NOTIFY: 'NOTIFY',
  MODE_SOFTAP: 'SOFTAP',
  MODE_RECORDING: 'RECORDING',
  MODE_STREAMING: 'STREAMING',
  MODE_UPGRADE: 'UPGRADE',
  MODE_RESET: 'RESET',
  MODE_UNCONFIG: 'UNCONFIG',
  MODE_ASLEEP: 'ASLEEP',
  MODE_UNKNOWN: 'UNKNOWN',
  MOTIONDETECTSLEEP_MIN: 'Min',
  MOTIONDETECTSLEEP_30S: '30s',
  MOTIONDETECTSLEEP_1M: '1m',
  MOTIONDETECTSLEEP_3M: '3m',
  MOTIONDETECTSLEEP_5M: '5m',
};
