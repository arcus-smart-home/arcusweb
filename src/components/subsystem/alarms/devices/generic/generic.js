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
import Device from 'i2web/models/device';
import { deviceNameSorter } from 'i2web/plugins/sorters';
import getAppState from 'i2web/plugins/get-app-state';
import Subsystem from 'i2web/models/subsystem';
import view from './generic.stache';
import _startCase from 'lodash/startCase';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/alarms/devices/generic
     * @description The alarm subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {Device.List} participatingDevices
     * @parent i2web/components/subsystem/alarms/devices/generic
     * @description The list of devices that are participating in alarms
     */
    participatingDevices: {
      Type: Device.List,
      value: [],
      get(lastSetVal) {
        const type = this.attr('type').toUpperCase();

        const allDevices = getAppState().attr('devices');
        const participatingDevices = this.attr(`subsystem.alarm:devices:${type}`);
        if (allDevices && participatingDevices.attr('length')) {
          return lastSetVal.replace(allDevices.filter(device => participatingDevices.attr().includes(device.attr('base:address'))).sort(deviceNameSorter));
        }
        return lastSetVal.replace([]);
      },
    },
    /**
     * @property {String} type
     * @parent i2web/components/subsystem/alarms/devices/generic
     * @description The type of devices that will be listed. Should be smoke/co/water leak
     */
    type: {
      type: 'string',
      value: '',
      set(value) {
        return value.toLowerCase();
      },
    },
    /**
     * @property {String} typeTitle
     * @parent i2web/components/subsystem/alarms/devices/generic
     * @description The stylized name of the title.
     */
    typeTitle: {
      get() {
        const type = this.attr('type');

        if (type === 'co') {
          return 'CO';
        } else if (type === 'water') {
          return 'Water Leak';
        }

        return _startCase(type);
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-alarms-devices-generic',
  viewModel: ViewModel,
  view,
});
