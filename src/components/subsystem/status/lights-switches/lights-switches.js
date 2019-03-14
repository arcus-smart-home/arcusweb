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

import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import Subsystem from 'i2web/models/subsystem';
import view from './lights-switches.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {number} onCount
     * @parent i2web/components/subsystem/status/lights-switches
     *
     * The number of "ON" devices in the subsystem.
     */
    onCount: {
      value: 0,
      get() {
        const deviceCounts = this.attr(`subsystem.${this.attr('subsystem.name')}:onDeviceCounts`);
        let count = 0;
        deviceCounts.each(function incrementOn(val) {
          count += val;
        });
        return count;
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/status/lights-switches
     *
     * The subsystem whose data we care about.
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {number} totalCount
     * @parent i2web/components/subsystem/status/lights-switches
     *
     * The total number of devices on the subsystem.
     */
    totalCount: {
      value: 0,
      get() {
        return this.attr(`subsystem.${this.attr('subsystem.name')}:switchDevices.length`);
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-status-lights-switches',
  viewModel: ViewModel,
  view,
});
