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
 * @module {Object} i2web/models/SubsystemService SubsystemService
 * @parent app.models.services
 *
 * Entry points for subsystems.
 */
export default {
  /**
   * @function ListSubsystems
   *
   * Lists all subsystems available for a given place
   *
   * @param {string} placeId UUID of the place
   * @return {Promise}
   */
  ListSubsystems(placeId) {
    return Bridge.request('subs:ListSubsystems', 'SERV:subs:', {
      placeId,
    });
  },
  /**
   * @function Reload
   *
   * Flushes and reloads all the subsystems at the active given place, intended for testing
   *
   * @return {Promise}
   */
  Reload() {
    return Bridge.request('subs:Reload', 'SERV:subs:', {});
  },
};
