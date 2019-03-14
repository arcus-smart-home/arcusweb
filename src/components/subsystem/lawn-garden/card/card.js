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

import CanList from 'can-list';
import CanMap from 'can-map';
import 'can-map-define';
import canRoute from 'can-route';
import Component from 'can-component';
import Device from 'i2web/models/device';
import { includes, isEmpty, values } from 'lodash';
import getAppState from 'i2web/plugins/get-app-state';
import moment from 'moment';
import Subsystem from 'i2web/models/subsystem';
import view from './card.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Boolean} allDevicesOffline
     * @parent i2web/components/lawn-garden/lawn-garden/card
     * Whether all lawn & garden devices are offline
     */
    allDevicesOffline: {
      get() {
        const devices = this.attr('devices');
        const offline = devices.filter(d => d.attr('isOffline'));
        return devices.attr('length') === offline.attr('length');
      },
    },
    /**
     * @property {AppState} appState
     * @parent i2web/components/lawn-garden/lawn-garden/card
     * The application view model
     */
    appState: {
      get(lastSet) {
        return lastSet || getAppState();
      },
    },
    /**
     * @property {Device.List} devices
     * @parent i2web/components/lawn-garden/lawn-garden/card
     * List of single and multi zone irrigation controllers on current place
     */
    devices: {
      get() {
        const allDevices = this.attr('appState.devices');
        let controllers = this.attr('subsystem.sublawnngarden:controllers');

        if (allDevices && controllers) {
          // get an array reference, instead of a Constructor
          controllers = controllers.attr();
          return allDevices.filter(d =>
            includes(controllers, d.attr('base:address')),
          );
        }

        return new Device.List();
      },
    },
    /**
     * @property {Object} nextScheduledEvent
     * @parent i2web/components/lawn-garden/lawn-garden/card
     * Info on next watering schedule event
     */
    nextScheduledEvent: {
      get() {
        const event = this.attr('subsystem.sublawnngarden:nextEvent');
        return isEmpty(event && event.attr()) ? null : event;
      },
    },
    /**
     * @property {String} nextScheduledEventInfo
     * @parent i2web/components/lawn-garden/lawn-garden/card
     * Info on next scheduled zone watering event
     *  <zonename>: <day> <time>
     */
    nextScheduledEventInfo: {
      get() {
        const event = this.attr('nextScheduledEvent');

        if (event) {
          const zoneName = this.getZoneName(event);
          const formatted = this.formatEventStartTime(event.attr('startTime'));

          return `${zoneName}: ${formatted}`;
        }

        return '';
      },
    },
    /**
     * @property {Boolean} noDevicesWateringAndNoEventsScheduled
     * @parent i2web/components/lawn-garden/lawn-garden/card
     * Whether there is no watering zone and no scheduled event
     */
    noDevicesWateringAndNoEventScheduled: {
      get() {
        return (
          !this.attr('zonesWatering.length') &&
          !this.attr('nextScheduledEvent') &&
          this.attr('devices.length')
        );
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/lawn-garden/card
     * Lawn-garden subsystem model
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {CanList} zonesWatering
     * @parent i2web/components/lawn-garden/lawn-garden/card
     * A list of the zones currently watering
     */
    zonesWatering: {
      get() {
        return new CanList(
          values(this.attr('subsystem.sublawnngarden:zonesWatering').attr()),
        );
      },
    },
    /**
     * @property {String} zonesWateringInfo
     * @parent i2web/components/lawn-garden/lawn-garden/card
     * Info on zones watering
     *  one zone: <zonename>
     *  two zones: <zonename1>, <zonename2>
     *  2+ zones: <zonename1>, & <total - 1> more
     */
    zonesWateringInfo: {
      get() {
        const devices = this.attr('devices');
        const zones = this.attr('zonesWatering');

        if (zones.attr('length') && devices.attr('length')) {
          const zonesCount = zones.attr('length');
          const firstZoneName = this.getZoneName(zones.attr(0));

          if (zonesCount === 1) return firstZoneName;
          if (zonesCount === 2) {
            return `${firstZoneName}, ${this.getZoneName(zones.attr(1))}`;
          }

          return `${firstZoneName} & ${zonesCount - 1} more`;
        }

        return '';
      },
    },
  },
  /*
   * Formats event start time for display
   * @param {Number} startTime
   */
  formatEventStartTime(startTime) {
    const when = moment(startTime);
    const day = when.day() === moment().day() ? 'Today' : when.format('ddd');
    return `${day} ${when.format('h:mm A')}`;
  },
  /*
   * Returns the zone name given a zone or event object
   * @param {Object} zoneOrEventInfo
   */
  getZoneName(zoneOrEventInfo) {
    const zoneId = zoneOrEventInfo.attr('zone');
    const deviceAddress = zoneOrEventInfo.attr('controller');

    // get the device use in the given zone
    const device = this.attr('devices')
      .filter(d => d.attr('base:address') === deviceAddress)
      .attr(0);


    return (device && (
      device.attr(`irr:zonename:${zoneId}`) ||
      `Zone ${device.attr(`irr:zonenum:${zoneId}`)}`
    )) || '';
  },
  /**
   * @property {Function} routeToStatusPage
   * @parent i2web/components/subsystem/lawn-garden/card
   * Routes to the Lawn and Garden status page
   */
  routeToStatusPage() {
    canRoute.attr({
      page: 'services',
      subpage: this.attr('subsystem.slug'),
      action: 'status',
    });
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-card-lawn-garden',
  viewModel: ViewModel,
  view,
});
