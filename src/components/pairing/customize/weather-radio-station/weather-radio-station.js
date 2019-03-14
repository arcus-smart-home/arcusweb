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

import 'can-construct-super';
import Device from 'i2web/models/device';
import { NoaaRadioComponent, NoaaRadioViewModel } from 'i2web/components/device/configurators/noaa-radio/';
import view from './weather-radio-station.stache';
import _ from 'lodash';

export const ViewModel = NoaaRadioViewModel.extend({
  define: {
    /**
     * @property {Object} customizationStep
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description Customization step that contains display text
     */
    customizationStep: {
      type: '*',
    },
    /**
     * @property {Array} description
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description Description field from the customization step, to be displayed in paragraphs
     */
    description: {
      get() {
        const step = this.attr('customizationStep');
        if (step && step.description && step.description.length > 0) {
          return step.description;
        }
        return ['Select the play button to determine which radio station is the clearest.  You\'ll hear the radio playing through Halo.'];
      },
    },
    /**
     * @property {Device} device
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description The device being customized
     */
    device: {
      Type: Device,
    },
    /**
     * @property {*} disableNextButton
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description Accept a disableNextButton method as an optional parameter for the component;
     * invoke this method whenever the scanning attribute changes to ensure user can't proceed in the middle of a
     * station scan
     */
    disableNextButton: {
      type: '*',
    },
    /**
     * @property {String} info
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description Info field from the customization step, to be displayed at the
     * inside bottom of the box-gray-radius.
     */
    info: {
      get() {
        const step = this.attr('customizationStep');
        return step && step.info
        ? step.info
        : 'Station quality should increase when plugged into AC power during installation.';
      },
    },
    /**
     * @property {String} scanState
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description Indicates whether scanning spinner, weak signal text or radio station list is shown
     */
    scanState: {
      type: 'string',
      value: 'weakSignal',
    },
    /**
     * @property {boolean} showAllStations
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description Indicates if all available radio stations are shown
     */
    showAllStations: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {String} subtitle
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description Title field from the customization step, to be displayed as the
     * title inside the box-gray-radius
     */
    subtitle: {
      get() {
        const step = this.attr('customizationStep');
        if (!this.attr('scanning') && this.attr('stations.length') === 0) {
          return 'Weak Radio Signal';
        }
        return step && step.title ? step.title : 'Select an Emergency Weather Station';
      },
    },
    /**
     * @property {String} title
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description Header field from the customization step, to be displayed as the primary
     * title directly below the staged progress bar.
     */
    title: {
      get() {
        const step = this.attr('customizationStep');
        if (!this.attr('scanning') && this.attr('stations.length') === 0) {
          return 'Attention';
        }
        return step && step.header ? step.header : 'Weather Radio';
      },
    },
    /**
     * @property {String} toggleStationsLinkText
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description Text to be displayed on link that toggles between more and less stations
     */
    toggleStationsLinkText: {
      get() {
        const showAll = this.attr('showAllStations');
        return showAll ? 'Less Stations' : 'More Stations';
      },
    },
    /**
     * @property {canList} visibleStations
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description List of stations to be displayed, based on showAllStations value; shows either all
     * available stations or a maximum of 3
     */
    visibleStations: {
      get() {
        if (this.attr('stations.length')) {
          return this.attr('showAllStations') ? this.attr('stations') : _.slice(this.attr('stations'), 0, 3);
        }
        return [];
      },
    },
    /**
     * @property {*} whenComplete
     * @parent i2web/components/pairing/customize/weather-radio-station
     * @description Accept a whenComplete method as an optional parameter for the component;
     * if specified, invoke this method when the station is changed
     */
    whenComplete: {
      type: '*',
    },
  },
  /**
   * @function toggleStations
   * @parent i2web/components/pairing/customize/weather-radio-station
   * Called when user clicks on link to show more or less stations
   */
  toggleStations() {
    const currentValue = this.attr('showAllStations');
    this.attr('showAllStations', !currentValue);
  },
});

export default NoaaRadioComponent.extend({
  tag: 'arcus-pairing-customize-weather-radio-station',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      this.viewModel.scanStations();
    },
    '{viewModel} scanning': function onScanningChange() {
      const vm = this.viewModel;
      if (vm.attr('disableNextButton')) {
        vm.attr('disableNextButton')(vm.attr('scanning'));
      }
    },
    '{viewModel.device} noaa:stationselected': function valueChanged() {
      const vm = this.viewModel;
      if (vm.attr('whenComplete')) {
        vm.attr('whenComplete')('WEATHER_RADIO_STATION');
      }
    },
  },
});
