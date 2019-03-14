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
 * @module {Object} i2web/models/Somfyv1 Somfyv1
 * @parent app.models.capabilities
 *
 * Model of a Somfy V1 Blind or Shade.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} somfyv1\:type
     *
     * The user has to set the type of device (Blinds or Shade) they have to generate the proper UI. Defaults to SHADE.
     *
     */
    'somfyv1:type',
    /**
     * @property {enum} somfyv1\:reversed
     *
     * The user may need to reverse the shade motor direction if wiring is reversed. Defaults to NORMAL.
     *
     */
    'somfyv1:reversed',
  ],
  methods: {
    /**
     * @function GoToOpen
     *
     * Move the Blinds or Shade to a pre-programmed OPEN position.
     *
     * @return {Promise}
     */
    GoToOpen() {
      return Bridge.request('somfyv1:GoToOpen', this.GetDestination(), {});
    },
    /**
     * @function GoToClosed
     *
     * Move the Blinds or Shade to a pre-programmed CLOSED position.
     *
     * @return {Promise}
     */
    GoToClosed() {
      return Bridge.request('somfyv1:GoToClosed', this.GetDestination(), {});
    },
    /**
     * @function GoToFavorite
     *
     * Move the Blinds or Shade to a pre-programmed FAVORITE position.
     *
     * @return {Promise}
     */
    GoToFavorite() {
      return Bridge.request('somfyv1:GoToFavorite', this.GetDestination(), {});
    },
  },
  events: {},
  TYPE_SHADE: 'SHADE',
  TYPE_BLIND: 'BLIND',
  REVERSED_NORMAL: 'NORMAL',
  REVERSED_REVERSED: 'REVERSED',
  CURRENTSTATE_OPEN: 'OPEN',
  CURRENTSTATE_CLOSED: 'CLOSED',
};
