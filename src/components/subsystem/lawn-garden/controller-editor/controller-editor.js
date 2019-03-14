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
import view from './controller-editor.stache';
import { formatDuration } from 'i2web/helpers/global';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Boolean} firstSixDisplayed
     * @parent i2web/components/subsystem/lawn-garden/controller-editor
     * @description PAIRING && 12 ZONE ONLY, first six zones (true), or
     * last six (false) are displayed
     */
    firstSixDisplayed: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {HTMLBoolean} forPairingCustomization
     * @parent i2web/components/subsystem/lawn-garden/controller-editor
     * @description PAIRING ONLY, is it used for pairing if so, display
     * the first six zones by default, hide the last six
     */
    forPairingCustomization: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {Boolean} forPairingMultiZone
     * @parent i2web/components/subsystem/lawn-garden/controller-editor
     * @description PAIRING ONLY, display the link that allows you to switch
     * between display for first or last six zone
     */
    forPairingMultiZone: {
      get() {
        return this.attr('forPairingCustomization')
          && this.attr('device')
          && this.attr('device.web:irr:zones.length') > 1;
      },
    },
    /**
     * @property {CanList} irrigationZones
     * @parent i2web/components/subsystem/lawn-garden/controller-editor
     * @description Display the list of irrigation zones. Only display 6 at a
     * time if `forPairingMultiZone` is true.
     */
    irrigationZones: {
      get() {
        const zones = this.attr('device.web:irr:zones');
        const range = this.attr('firstSixDisplayed') ? [0, 6] : [6, 12];
        return (zones && this.attr('forPairingMultiZone'))
          ? zones.slice(...range)
          : zones;
      },
    },
    /**
     * @property {function} onDurationChange
     * @parent i2web/components/pairing/customize/irrigation-zone
     * @description Accept a method as an optional parameter for the component;
     * if specified, invoke this method when the water duration for a zone
     * has changed.
     */
    onDurationChange: {},
    /**
     * @property {List<Option>} durationOptions
     * @parent i2web/components/pairing/customize/irrigation-zone
     * @description List of objects with the label/value pairs displayed in the duration dropdowns.
     */
    durationOptions: {
      get() {
        let zones = this.attr('irrigationZones.0');

        if (zones) {
          zones = zones.attr('possibleWateringTimes').map((minutes) => {
            return {
              value: minutes,
              label: formatDuration(minutes, 'minutes'),
            };
          });
        }

        return zones;
      },
    },
  },
  /**
   * @function toggleFirstLastSix
   * @parent i2web/components/subsystem/lawn-garden/controller-editor
   * @description Toggle between display the first 6 zones and the last six zones
   */
  toggleFirstLastSix() {
    const firstSix = this.attr('firstSixDisplayed');
    this.attr('firstSixDisplayed', !firstSix);
  },
});

export default Component.extend({
  tag: 'arcus-lawn-garden-controller-editor',
  viewModel: ViewModel,
  view,
  events: {
    durationChanged: null,
    nameChanged: null,
    inserted() {
      this.durationChanged = this.waterDurationChanged.bind(this);
      this.nameChanged = this.zoneNameChanged.bind(this);
      this.viewModel.attr('device.web:irr:zones').forEach((z) => {
        z.on('defaultDuration', this.durationChanged);
        z.on('zonename', this.nameChanged);
      });
    },
    removed() {
      this.viewModel.attr('device.web:irr:zones').forEach((z) => {
        z.off('defaultDuration', this.durationChanged);
        z.off('zonename', this.nameChanged);
      });
    },
    zoneNameChanged() {
      this.viewModel.attr('device').save();
    },
    waterDurationChanged() {
      const vm = this.viewModel;
      vm.attr('device').save();
      if (vm.attr('onDurationChanged')) { vm.onDurationChanged(); }
    },
  },
});
