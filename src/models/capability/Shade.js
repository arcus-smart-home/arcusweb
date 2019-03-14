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
 * @module {Object} i2web/models/Shade Shade
 * @parent app.models.capabilities
 *
 * Model of a window shade.
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} shade\:level
     *
     * The percentage that the shades are open (raised/lowered). May also be used to set how closed (lowered) or open (raised) the shade is where 100% is fully open and 0% is fully closed. For devices that only support being set fully Open (Raised) or Closed (Lowered), use 0% for Closed (Lowered) and 100% for Open (Raised).
     *
     */
    'shade:level',
  ],
  methods: {
    /**
     * @function GoToOpen
     *
     * Move the shade to a pre-programmed OPEN position.
     *
     * @return {Promise}
     */
    GoToOpen() {
      return Bridge.request('shade:GoToOpen', this.GetDestination(), {});
    },
    /**
     * @function GoToClosed
     *
     * Move the shade to a pre-programmed CLOSED position.
     *
     * @return {Promise}
     */
    GoToClosed() {
      return Bridge.request('shade:GoToClosed', this.GetDestination(), {});
    },
    /**
     * @function GoToFavorite
     *
     * Move the shade to a pre-programmed FAVORITE position.
     *
     * @return {Promise}
     */
    GoToFavorite() {
      return Bridge.request('shade:GoToFavorite', this.GetDestination(), {});
    },
  },
  events: {},
  SHADESTATE_OK: 'OK',
  SHADESTATE_OBSTRUCTION: 'OBSTRUCTION',
};
