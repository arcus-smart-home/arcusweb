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

import CanMap from 'can-map';
import CanList from 'can-list';
import Observation from 'can-observation';
import isString from 'lodash/isString';

// create a getter that is a proxy to a property on the zones controller model
function createZoneGetter(prop) {
  return function zoneGetter() {
    return this.attr(`controller.irr:${prop}:z${this.zoneIndex}`);
  };
}

// create a setter that is a proxy to a property on the zones controller model
function createZoneSetter(prop) {
  return function zoneSetter(value) {
    return this.attr(`controller.irr:${prop}:z${this.zoneIndex}`, value);
  };
}

// keeping this separate since we want custom behaviour around it
const zoneNameSetter = createZoneSetter('zonename');

const Zone = CanMap.extend({
  define: {
    // the current irrigation state keyword
    zoneState: {
      get: createZoneGetter('zoneState'),
    },
    // the index of this zone used during sorting
    zonenum: {
      get: createZoneGetter('zonenum'),
      set: createZoneSetter('zonenum'),
    },
    // the color code of this zone
    zonecolor: {
      get: createZoneGetter('zonecolor'),
      set: createZoneSetter('zonecolor'),
    },
    // the name of this zone
    zonename: {
      get: createZoneGetter('zonename'),
      set(newVal) {
        const value = isString(newVal) && newVal.length > 0 ? newVal : `Zone ${this.zoneIndex}`;
        zoneNameSetter.call(this, value);
      },
    },
    // minutes remaining in the active watering of the zone
    wateringDuration: {
      get: createZoneGetter('wateringDuration'),
    },
    // default length of time that a zone should be watered (in minutes)
    defaultDuration: {
      type: 'number',
      get: createZoneGetter('defaultDuration'),
      set: createZoneSetter('defaultDuration'),
    },
    // alias of zonenum
    sortIndex: {
      get() { return this.attr('zonenum'); },
      set(val) { return this.attr('zonenum', val); },
    },
    durationPropName: {
      get() {
        return `controller.irr:wateringDuration:z${this.attr('zonenum')}`;
      },
    },
    defaultDurationPropName: {
      get() {
        return `controller.irr:defaultDuration:z${this.attr('zonenum')}`;
      },
    },
  },
  // selectable values for 'wateringDuration' (in minutes)
  possibleWateringTimes: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30, 45, 60, 120, 180, 240,
  ],
});

const ZoneList = CanList.extend({
  Map: Zone,

  // get a new ZoneList that is a proxy for all the zone properties on a irrigation controller device model
  fromIrrigationController(controller) {
    const zoneCount = controller.attr('irrcont:numZones');

    if (!zoneCount) { return null; }

    // get list of zone descriptors
    const zones = new Array(zoneCount).fill().map((val, i) => {
      return {
        zoneIndex: i + 1,
        controller,
      };
    });

    let zoneList;
    // ignore unneeded observations created during initial list sort
    // prevents this observations including the value returned from being regenerated when sortIndex changes
    Observation.ignore(() => {
      // create list of zone models from zone descriptors
      zoneList = new ZoneList(zones);
    })();

    return zoneList;
  },
}, {
  comparator: 'sortIndex',
});

export { ZoneList, Zone, Zone as default };
