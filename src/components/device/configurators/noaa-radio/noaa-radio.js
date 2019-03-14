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
import _ from 'lodash';
import 'can-map-define';
import Device from 'i2web/models/device';
import Errors from 'i2web/plugins/errors';
import view from './noaa-radio.stache';
import 'i2web/helpers/form-fields';

export const NoaaRadioViewModel = canMap.extend({
  define: {
    /**
     * @property {Device} device
     * @parent i2web/components/device/configurators/noaa-radio
     * @description device being configured
     */
    device: {
      Type: Device,
    },
    /**
     * @property {htmlbool} initialScan
     * @parent i2web/components/device/configurators/noaa-radio
     * @description Indicates if user has yet to perform an initial scan
     */
    initialScan: {
      type: 'htmlbool',
      value: true,
    },
    /**
     * @property {string} playingStation
     * @parent i2web/components/device/configurators/noaa-radio
     * @description Station currently playing on the Halo
     */
    playingStation: {
      value: -1,
    },
    /**
     * @property {boolean} scanning
     * @parent i2web/components/device/configurators/noaa-radio
     * @description Indicates if we are still waiting for the Scan Stations response.
     */
    scanning: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {string} station
     * @parent i2web/components/device/configurators/noaa-radio
     * @description User selected station
     */
    station: {
      Type: 'string',
      set(station) {
        this.attr('device').SelectStation(station).catch(e => Errors.log(e, true));
      },
    },
    /**
     * @property {canList} stations
     * @parent i2web/components/device/configurators/noaa-radio
     * @description List of National Weather Service stations near selected location
     */
    stations: {
      value: [],
    },
  },
  /**
   * @function startPlaying
   * @parent i2web/components/device/configurators/noaa-radio
   * @description Passes the station id to the PlayStation function which will play the
   * station for at least 10 seconds.
   */
  startPlaying(station) {
    this.attr('device').PlayStation(station.id, 10).then(() => this.attr('playingStation', station.id)).catch(e => Errors.log(e));
  },
  /**
  * @function stopPlaying
  * @parent i2web/components/device/configurators/noaa-radio
  * @description Passes the station id to the StopPlayingStation function which will
  * set the playingStation variable to -1 causing no station to play.
  */
  stopPlaying() {
    this.attr('device').StopPlayingStation().then(() => this.attr('playingStation', -1)).catch(e => Errors.log(e));
  },
  /**
  * @function setStation
  * @parent i2web/components/device/configurators/noaa-radio
  * @description Passes the station id to the device's noaa:stationselected attribute.
  */
  setStation(station) {
    this.attr('device.noaa:stationselected', station.id);
    this.attr('device').save().catch(e => Errors.log(e));
  },
  /**
   * @function scanStations
   * @parent i2web/components/device/configurators/noaa-radio
   * @description Asks Halo device to scan for National Weather Service stations within range
   */
  scanStations() {
    this.attr('scanning', true);
    this.attr('stations').replace([]);
    this.attr('device').ScanStations().then(({ stations }) => {
      this.attr('scanning', false);
      this.attr('initialScan', false);
      this.attr('stations').replace(_.sortBy(_.filter(stations, (s) => {
        return s.rssi && parseFloat(s.rssi, 10) > 0;
      }), 'rssi'));
    }).catch((e) => {
      this.attr('scanning', false);
      this.attr('initialScan', false);
      Errors.log(e);
    });
  },
});

export const NoaaRadioComponent = Component.extend({
  tag: 'arcus-device-configurator-noaa-radio',
  viewModel: NoaaRadioViewModel,
  view,
});
