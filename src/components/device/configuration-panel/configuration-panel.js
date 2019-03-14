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
import view from './configuration-panel.stache';
import Device from 'i2web/models/device';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Device} device
     * @parent i2web/components/device/configuration-panel
     *
     * The device being displayed in the panel
     */
    device: {
      Type: Device,
      set(device) {
        if (device) {
          this.attr('configurators', device.attr('configurators'));
        }
        return device;
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-device-configuration-panel',
  viewModel: ViewModel,
  view,
});
