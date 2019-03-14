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

import Bridge from 'i2web/cornea/bridge';

/**
 * @module {Object} i2web/models/WeatherRadio WeatherRadio
 * @parent app.models.capabilities
 *
 * Model of a Weather Radio.
 */
export default {
  writeableAttributes: [
    /**
     * @property {list<string>} noaa\:alertsofinterest
     *
     * List of EAS alert codes the user wishes to be notifed of (three letter strings).
     *
     */
    'noaa:alertsofinterest',
    /**
     * @property {string} noaa\:location
     *
     * Six digit S.A.M.E. code for locations published by NOAA.
     *
     */
    'noaa:location',
    /**
     * @property {int} noaa\:stationselected
     *
     * station ID of selected station.
     *
     */
    'noaa:stationselected',
  ],
  methods: {
    /**
     * @function ScanStations
     *
     * Scans all stations to determine which can be heard.
     *
     * @return {Promise}
     */
    ScanStations() {
      return Bridge.request('noaa:ScanStations', this.GetDestination(), {});
    },
    /**
     * @function PlayStation
     *
     * Play selected station to allow user to select amongst the options.
     *
     * @param {int} station The ID of the station to play (1-7)
     * @param {int} time Timeout in seconds after which player will stop (-1 to play forever)
     * @return {Promise}
     */
    PlayStation(station, time) {
      return Bridge.request('noaa:PlayStation', this.GetDestination(), {
        station,
        time,
      });
    },
    /**
     * @function StopPlayingStation
     *
     * Stop playing current station.
     *
     * @return {Promise}
     */
    StopPlayingStation() {
      return Bridge.request('noaa:StopPlayingStation', this.GetDestination(), {});
    },
    /**
     * @function SelectStation
     *
     * Select station as the one Halo will use.
     *
     * @param {int} station The ID of the station to use (1-7)
     * @return {Promise}
     */
    SelectStation(station) {
      return Bridge.request('noaa:SelectStation', this.GetDestination(), {
        station,
      });
    },
  },
  events: {},
  ALERTSTATE_ALERT: 'ALERT',
  ALERTSTATE_NO_ALERT: 'NO_ALERT',
  ALERTSTATE_HUSHED: 'HUSHED',
  PLAYINGSTATE_PLAYING: 'PLAYING',
  PLAYINGSTATE_QUIET: 'QUIET',
};
