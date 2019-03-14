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
import view from './card.stache';
import Subsystem from 'i2web/models/subsystem';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/card
     *
     * subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {Boolean} showDeviceList
     * @parent i2web/components/subsystem/card
     *
     * Indicates if a simple device listing should be shown for the service card
     */
    showDeviceList: {
      get() {
        const isSupported = this.attr('subsystem.supported');
        const isAvailable = this.attr('subsystem.available');
        const hasDevices = this.attr('subsystem.allDevices');
        return isSupported && isAvailable && hasDevices;
      },
    },
    /**
     * @property {Boolean} manageOnMobile
     * @parent i2web/components/subsystem/card
     *
     * Indicates if the service card needs to be shown with direct instructions to manage on mobile
     */
    manageOnMobile: {
      get() {
        const isSupported = this.attr('subsystem.supported');
        const isAvailable = this.attr('subsystem.available');
        return !isSupported && isAvailable;
      },
    },
  },
  /**
   * @function {Boolean} renderCustomCard
   * @param {Subsystem} subsystem
   * @description We only want to render customCards for systems
   * that are available. We /always/ want to show Alarms for upsell purposes.
   */
  renderCustomCard(subsystem) {
    if (subsystem.attr('customCard')) {
      return subsystem.attr('available');
    }
    return false;
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-card',
  viewModel: ViewModel,
  view,
});
