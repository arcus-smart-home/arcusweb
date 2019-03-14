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

import mapValues from 'lodash/mapValues';
import toPairs from 'lodash/toPairs';

const idToFormAttrs = {
  'hub-id': {
    maxlength: 8,
  },
};

// convert js struct above to object like:
// {
//  "input-name": "attOne='one' attrTwo='two'"
// ...
// }
export default mapValues(idToFormAttrs, (formAttrs) => {
  return toPairs(formAttrs)
    .map(([attrName, attrVal]) => `${attrName}='${attrVal}'`)
    .join(' ');
});
