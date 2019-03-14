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

// convert temperatures between celsius (as stored on the server) and fahrenheit
//
// zeroRelative - used to indicate if a value being converted is a specific temperature measured in degrees
//                (which is relative to 0) or an abstract number of degrees (which is not relative to 0)
export default function convert(toConvert, to = 'F', zeroRelative = true) {
  let value = toConvert;
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  if (isNaN(value) || typeof value !== 'number') {
    console.warn('Invalid value passed to temperature converter.');
    return value;
  }

  if (to === 'F') {
    return Math.round((value * (9 / 5)) + (zeroRelative ? 32 : 0));
  }
  // return Math.round((value - 32) * (5 / 9));
  return Math.round(value - (zeroRelative ? 32 : 0)) * (5 / 9);
}
