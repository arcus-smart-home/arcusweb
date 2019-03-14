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

import _ from 'lodash';
import AppState from 'i2web/plugins/get-app-state';

/**
 * @function findOptions
 * @parent i2web/components/rules/selectors/filter-options
 *
 * Given a list of options, find the corresponding objects in a
 * particular collection stored on the Application State.
 * @param {Array<Array<String, String>>} options The options to find
 * @param {String} type The collection to look in
 * @param {String} property The property used to identify the object
 * @return {Array<Object>}
 */
export default function findOptions(options, type, property) {
  const ids = options.map(opt => opt[1]);
  return _.filter(AppState().attr(type), (item) => {
    return _.find(ids, (id) => {
      return id === item[property];
    });
  });
}
