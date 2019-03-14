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

/**
 * @module {Function} i2web/connections/helpers/overwrite overwrite
 * @parent api.connections
 *
 * Augments a Constructor's prototype and static methods using the provided overwrite functions.
 *
 * Each overwrite function is called with the Constructor's method and the calling connection. It should return a new
 * function to overwrite the Constructor.
 *
 * @param {can-connect.Behavior} connection
 * @param {canMap} Constructor
 * @param {Object} prototype collection of overwrite functions for the Contsructor's prototype
 * @param {Object} statics collection of overwrite functions for the Contsructor's static
 */
export default function overwrite(connection, Constructor, prototype, statics) {
  let prop;

  for (prop in prototype) { // eslint-disable-line no-restricted-syntax,guard-for-in
    Constructor.prototype[prop] = prototype[prop](Constructor.prototype[prop], connection);
  }
  if (statics) {
    for (prop in statics) { // eslint-disable-line no-restricted-syntax,guard-for-in
      Constructor[prop] = statics[prop](Constructor[prop], connection);
    }
  }
}
