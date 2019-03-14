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
 * @module {Object} i2web/models/CameraPTZ CameraPTZ
 * @parent app.models.capabilities
 *
 * Model of Camera Pan/Tilt/Zoom functionality on a device.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function GotoHome
     *
     * Moves the camera to its home position
     *
     * @return {Promise}
     */
    GotoHome() {
      return Bridge.request('cameraptz:GotoHome', this.GetDestination(), {});
    },
    /**
     * @function GotoAbsolute
     *
     * Moves the camera to an absolute position
     *
     * @param {int} pan Absolute pan position
     * @param {int} tilt Absolute tilt position
     * @param {int} [zoom] Absolute zoom value
     * @return {Promise}
     */
    GotoAbsolute(pan, tilt, zoom) {
      return Bridge.request('cameraptz:GotoAbsolute', this.GetDestination(), {
        pan,
        tilt,
        zoom,
      });
    },
    /**
     * @function GotoRelative
     *
     * Moves the camera to a relative position
     *
     * @param {int} deltaPan Relative pan position
     * @param {int} deltaTilt Relative tilt position
     * @param {int} [deltaZoom] Relative zoom value
     * @return {Promise}
     */
    GotoRelative(deltaPan, deltaTilt, deltaZoom) {
      return Bridge.request('cameraptz:GotoRelative', this.GetDestination(), {
        deltaPan,
        deltaTilt,
        deltaZoom,
      });
    },
  },
  events: {},

};
