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
 * @module {Object} i2web/models/Dimmer Dimmer
 * @parent app.models.capabilities
 *
 * Model of a dimmable device.
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} dim\:brightness
     *
     * Reflects the current level of brightness, as a percentage. If ramping is not desired, this parameter can be set to immediately achieve the desired brightness level.
     *
     */
    'dim:brightness',
  ],
  methods: {
    /**
     * @function RampBrightness
     *
     * Sets a rampingtarget and a rampingtime for the dimmer. Brightness must be 0..100, seconds must be a positive integer.
     *
     * @param {int} brightness Brightness percentage within the range of 0..100
     * @param {int} seconds Number of seconds to reach desired brightness; must be a positive integer
     * @return {Promise}
     */
    RampBrightness(brightness, seconds) {
      return Bridge.request('dim:RampBrightness', this.GetDestination(), {
        brightness,
        seconds,
      });
    },
    /**
     * @function IncrementBrightness
     *
     * Increments the brightness of the dimmer by a given amount.
     *
     * @param {int} amount The amount to increase the brightness as a percentage from 0 to 100
     * @return {Promise}
     */
    IncrementBrightness(amount) {
      return Bridge.request('dim:IncrementBrightness', this.GetDestination(), {
        amount,
      });
    },
    /**
     * @function DecrementBrightness
     *
     * Decrements the brightness of the dimmer by a given amount.
     *
     * @param {int} amount The amount to decrease the brightness as a percentage from 0 to 100
     * @return {Promise}
     */
    DecrementBrightness(amount) {
      return Bridge.request('dim:DecrementBrightness', this.GetDestination(), {
        amount,
      });
    },
  },
  events: {},

};
