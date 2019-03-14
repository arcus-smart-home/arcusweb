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
import CanMap from 'can-map';
import 'can-map-define';
import { capitalize, find, isFunction } from 'lodash';
import { formatDate, formatTime } from 'i2web/helpers/global';
import Errors from 'i2web/plugins/errors';
import getAppState from 'i2web/plugins/get-app-state';
import knownAlerts from 'config/weatheralerts.json';
import SidePanel from 'i2web/plugins/side-panel';
import view from './alerts.stache';
import HaloCapability from 'i2web/models/capability/Halo';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {AppState} appState
     * @parent i2web/components/subsystem/weather/alerts
     * The application view model
     */
    appState: {
      get(lastSet) {
        return lastSet || getAppState();
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/weather/alerts
     * The current place where the devices are located
     */
    place: {
      get() {
        return this.attr('appState.place');
      },
    },
    /**
     * @property {CanList<Devices>} signalingDevices
     * @parent i2web/components/subsystem/weather/alerts
     * List of weather radios signaling alerts
     */
    signalingDevices: {
      get() {
        const allDevices = this.attr('appState.devices');
        const weather = this.attr('weather');

        // collect all weather radios signaling alerts
        return weather
          .attr('subweather:weatherRadios')
          .map(function toDevice(address) {
            return allDevices
              .filter(d => d.attr('base:address') === address)
              .attr(0);
          })
          .filter(function isAlerting(d) {
            return d.attr('halo:devicestate') === HaloCapability.DEVICESTATE_WEATHER;
          });
      },
    },
    /**
     * @property {Subsystem} weather
     * @parent i2web/components/subsystem/weather/alerts
     * The weather subsystem
     */
    weather: {
      get() {
        return this.attr('appState.subsystems').findByName('subweather');
      },
    },
    /**
     * @property {CanList} weatherAlerts
     * List of objects with data to display about the current weather alerts
     */
    weatherAlerts: {
      get() {
        const place = this.attr('place');
        const devices = this.attr('signalingDevices');

        return devices.map((device) => {
          return {
            county: place.attr('place:addrCounty'),
            description: this.getAlertDescription(
              device.attr('noaa:currentalert'),
            ),
            deviceName: device.attr('dev:name'),
            issuedAt: this.formatAlertTime(device.attr('noaa:lastalerttime')),
            state: place.attr('place:state'),
          };
        });
      },
    },
  },
  /**
   * @function formatAlertTime
   * @param {Number} timestamp
   * Returns a formatted string of the last known alert time, e.g:
   *  Jan 22, 2018 at 10:02 AM
   */
  formatAlertTime(timestamp) {
    return `${formatDate(timestamp, 'MMM DD, YYYY')} at ${formatTime(timestamp)}`;
  },
  /**
   * @function getAlertDescription
   * @param {String} code
   * Returns the alert description given an emergency alert system code
   */
  getAlertDescription(code) {
    const alert = find(knownAlerts, { code });
    return alert ? alert.description : capitalize(code);
  },
  /**
   * @function snoozeAlerts
   * Callback for the "Snooze" button
   */
  snoozeAlerts() {
    const promises = this.attr('signalingDevices').map((device) => {
      return isFunction(device.StartHush) ? device.StartHush() : null;
    });

    return Promise.all(promises)
      .then(() => SidePanel.closeRight())
      .catch(Errors.log);
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-weather-alerts',
  viewModel: ViewModel,
  view,
});
