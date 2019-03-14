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

import canMap from 'can-map';
import subsystemConfig from 'config/subsystem.json';

export function deviceNameSorter(d1, d2) {
  const val1 = (d1 instanceof canMap ? d1.attr('dev:name') : d1['dev:name']).toLowerCase();
  const val2 = (d2 instanceof canMap ? d2.attr('dev:name') : d2['dev:name']).toLowerCase();

  if (val1 === val2) return 0;
  return (val1 > val2) ? 1 : -1;
}

export function personNameSorter(p1, p2) {
  const first1 = p1 instanceof canMap ? p1.attr('person:firstName') : p1['person:firstName'];
  const last1 = p1 instanceof canMap ? p1.attr('person:lastName') : p1['person:lastName'];
  const first2 = p2 instanceof canMap ? p2.attr('person:firstName') : p2['person:firstName'];
  const last2 = p2 instanceof canMap ? p2.attr('person:lastName') : p2['person:lastName'];

  const p1name = `${first1} ${last1}`.toLowerCase();
  const p2name = `${first2} ${last2}`.toLowerCase();

  if (p1name === p2name) return 0;
  return (p1name > p2name) ? 1 : -1;
}

export function sceneNameSorter(s1, s2) {
  const val1 = (s1 instanceof canMap ? s1.attr('scene:name') : s1['scene:name']).toLowerCase();
  const val2 = (s2 instanceof canMap ? s2.attr('scene:name') : s2['scene:name']).toLowerCase();

  if (val1 === val2) return 0;
  return (val1 > val2) ? 1 : -1;
}

export function subsystemSorter(s1, s2) {
  let val1 = 1;
  let val2 = 2;
  if (s1 instanceof canMap) {
    val1 = s1.attr('ordinal');
  } else {
    const subsysName1 = s1['base:address'].split(':')[1];
    const subsys1 = subsysName1 && subsystemConfig[subsysName1];
    if (subsys1 && subsys1.ordinal) val1 = subsys1.ordinal;
  }
  if (s2 instanceof canMap) {
    val2 = s2.attr('ordinal');
  } else {
    const subsysName2 = s2['base:address'].split(':')[1];
    const subsys2 = subsysName2 && subsystemConfig[subsysName2];
    if (subsys2 && subsys2.ordinal) val2 = subsys2.ordinal;
  }

  if (val1 === val2) return 0;
  return (val1 > val2) ? 1 : -1;
}

export function placeNameSorter(s1, s2) {
  const val1 = (s1.placeName || s1.name).toLowerCase();
  const val2 = (s2.placeName || s2.name).toLowerCase();

  if (val1 === val2) return 0;
  return (val1 > val2) ? 1 : -1;
}
