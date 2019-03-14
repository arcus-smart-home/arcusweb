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
import canRoute from 'can-route';
import 'can-map-define';
import Device from 'i2web/models/device';
import view from './list.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Device.List} devices
     * @parent i2web/components/device/list
     *
     * The list of devices
     */
    devices: {
      Type: Device.List,
    },
  },
  /**
   * @function {Boolean} focused
   * @parent i2web/components/device/list
   * @param {String} id
   * @description Is the device list focused on a specific device
   */
  focused(id) {
    return canRoute.attr('anchor') && canRoute.attr('anchor') === id;
  },
});

export default Component.extend({
  tag: 'arcus-device-list',
  viewModel: ViewModel,
  view,
});
