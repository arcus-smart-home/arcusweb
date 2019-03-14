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
 * @module {Object} i2web/models/SupportSessionService SupportSessionService
 * @parent app.models.services
 *
 * Support Session Service
 */
export default {
  /**
   * @function ListAllActiveSessions
   *
   * Find all active support customer sessions (if any)
   *
   * @param {int} [limit] The maximum number of sessions to return (defaults to 50)
   * @param {string} [token] The token from a previous query to use for retrieving the next set of results
   * @return {Promise}
   */
  ListAllActiveSessions(limit, token) {
    return Bridge.request('suppcustsession:ListAllActiveSessions', 'SERV:suppcustsession:', {
      limit,
      token,
    });
  },
};
