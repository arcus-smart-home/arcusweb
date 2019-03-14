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

import _ from 'lodash';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import view from './noaa-weather-alerts.stache';
import weatheralertConfig from 'config/weatheralerts.json';
import Device from 'i2web/models/device';
import Errors from 'i2web/plugins/errors';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Object} popular
     * @parent i2web/components/device/noaa-weather-alerts/noaa-weather-alerts
     * @description A filtered version of the total noaa-weather-alerts, consisting of all the
     * popular alerts the user has not already subscribed to. This is based on the property
     * `popular` which should be true.
     */
    popular: {
      get() {
        const myAlerts = (this.attr('device.noaa:alertsofinterest') && this.attr('device.noaa:alertsofinterest').attr()) || [];
        const popularAlerts = _.filter(weatheralertConfig, (alert) => {
          return alert.popular && !myAlerts.includes(alert.code);
        });
        return _.sortBy(popularAlerts, 'description');
      },
    },
    /**
     * @property {Object} unpopular
     * @parent i2web/components/device/noaa-weather-alerts/noaa-weather-alerts
     * @description A filtered version of the total noaa-weather-alerts, consisting of all the
     * unpopular alerts the user has not already subscribed to. This is based on the property
     * `popular` which should be false.
     */
    unpopular: {
      get() {
        const myAlerts = (this.attr('device.noaa:alertsofinterest') && this.attr('device.noaa:alertsofinterest').attr()) || [];
        const unpopularAlerts = _.filter(weatheralertConfig, (alert) => {
          return !alert.popular && !myAlerts.includes(alert.code);
        });
        return _.sortBy(unpopularAlerts, 'description');
      },
    },
    /**
     * @property {Device} device
     * @parent i2web/components/device/noaa-weather-alerts/noaa-weather-alerts
     * @description device being configured
     */
    device: {
      Type: Device,
    },
    /**
     * @property {Object} alertsOfInterest
     * @parent i2web/components/device/noaa-weather-alerts/noaa-weather-alerts
     * @description A filtered version of the total noaa-weather-alerts, consisting of all the
     * alerts the user subscribed to.
     */
    alertsOfInterest: {
      type: '*',
      get() {
        const myAlerts = (this.attr('device.noaa:alertsofinterest') && this.attr('device.noaa:alertsofinterest').attr()) || [];
        const myAlertsObjects = _.filter(weatheralertConfig,
          (alert) => {
            return myAlerts.includes(alert.code);
          });
        return _.sortBy(myAlertsObjects, 'description');
      },
    },
  },

  /**
   * @function addAlert
   * @parent i2web/components/device/noaa-weather-alerts/noaa-weather-alerts
   * @param {canMap} code The item to be added
   * @param {Object} ev The event object
   * @description Moves the alert to the My Alerts list
   */
  addAlert(code, ev) {
    const myAlerts = this.attr('device.noaa:alertsofinterest').attr();

    ev.preventDefault();
    ev.stopPropagation();

    myAlerts.push(code);

    this.attr('device.noaa:alertsofinterest', myAlerts);
    this.attr('device').save().catch(e => Errors.log(e));
  },

  /**
   * @function removeAlert
   * @parent i2web/components/device/noaa-weather-alerts/noaa-weather-alerts
   * @param {canMap} code The item to be removed
   * @param {Object} ev The event object
   * @description Moves the alert out of My Alerts list and back to its original list
   */
  removeAlert(code, ev) {
    const myAlerts = this.attr('device.noaa:alertsofinterest').attr();
    const index = myAlerts.indexOf(code);

    ev.preventDefault();
    ev.stopPropagation();

    myAlerts.splice(index, 1);

    this.attr('device.noaa:alertsofinterest', myAlerts);
    this.attr('device').save().catch(e => Errors.log(e));
  },
});

export default Component.extend({
  tag: 'arcus-device-configurator-noaa-weather-alerts',
  viewModel: ViewModel,
  view,
});
