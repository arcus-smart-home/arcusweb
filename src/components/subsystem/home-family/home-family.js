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
import CanList from 'can-list';
import canMap from 'can-map';
import canRoute from 'can-route';
import 'can-map-define';
import Person from 'i2web/models/person';
import Subsystem from 'i2web/models/subsystem';
import SubsystemCapability from 'i2web/models/capability/Subsystem';
import AppState from 'i2web/plugins/get-app-state';
import SidePanel from 'i2web/plugins/side-panel';
import view from './home-family.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Number} atHomeCount
     * @parent i2web/components/subsystem/home-family
     * @description All the subsystem devices
     */
    allDevices: {
      get() {
        const devices = this.attr('subsystem').attr('subspres:allDevices');
        return devices.map((d) => {
          return _.find(AppState().attr('devices'), (device) => {
            return device.attr('base:address') === d;
          });
        });
      },
    },
    /**
     * @property {Number} atHomeCount
     * @parent i2web/components/subsystem/home-family
     * @description The number of people and devices currently at home
     */
    atHomeCount: {
      get() {
        return this.attr('peopleAtHome.length') + this.attr('devicesAtHome.length');
      },
    },
    /**
     * @property {Number} awayCount
     * @parent i2web/components/subsystem/home-family
     * @description The number of people and devices currently away from home
     */
    awayCount: {
      get() {
        return this.attr('peopleAway.length') + this.attr('devicesAway.length');
      },
    },
    /**
     * @property {canList} devicesAtHome
     * @parent i2web/components/subsystem/home-family
     * @description The devices currently at home
     */
    devicesAtHome: {
      get() {
        this.attr('subsystem').attr('subspres:devicesAtHome.length');
        return this.presenceObjectsHomeAway('devices', true);
      },
    },
    /**
     * @property {canList} devicesAway
     * @parent i2web/components/subsystem/home-family
     * @description The devices currently away from home
     */
    devicesAway: {
      get() {
        this.attr('subsystem').attr('subspres:devicesAway.length');
        return this.presenceObjectsHomeAway('devices', false);
      },
    },
    /**
     * @property {canList} peopleAtHome
     * @parent i2web/components/subsystem/home-family
     * @description The people currently at home
     */
    peopleAtHome: {
      get() {
        this.attr('subsystem').attr('subspres:peopleAtHome.length');
        return this.presenceObjectsHomeAway('people', true);
      },
    },
    /**
     * @property {canList} peopleAway
     * @parent i2web/components/subsystem/home-family
     * @description The people currently away from home
     */
    peopleAway: {
      get() {
        this.attr('subsystem').attr('subspres:peopleAway.length');
        return this.presenceObjectsHomeAway('people', false);
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/home-family
     * @description The home and family subsystem
     */
    subsystem: {
      Type: Subsystem,
      set(subsystem) {
        if (subsystem && subsystem.attr('subs:state') !== SubsystemCapability.STATE_ACTIVE) {
          this.routeToDashboard();
        }
        return subsystem;
      },
    },
  },
  /**
   * @function presenceObjectsHomeAway
   * @parent i2web/components/subsystem/home-family
   * @param {String} thing the string 'devices' or 'people'
   * @param {Boolean} atHome collection should refer to things at home or away
   * @description Return a collection of people or devices that are home or away
   */
  presenceObjectsHomeAway(thing, atHome) {
    const placeThings = AppState().attr(thing);
    if (placeThings) {
      const property = `subspres:${thing}${(atHome) ? 'AtHome' : 'Away'}`;
      const subsystemThings = this.attr('subsystem').attr(property);
      const filteredPresenceObjects = placeThings.filter((t) => {
        return _.includes(subsystemThings, t.attr('base:address'));
      });
      filteredPresenceObjects.attr('comparator', (thing === 'people' ? 'person:name' : 'dev:name'));
      return filteredPresenceObjects;
    }
    return new CanList([]);
  },
  /**
   * @function routeToDashboard
   * @parent i2web/components/subsystem/home-family
   * @description redirects the user to the Dashboard page
   */
  routeToDashboard() {
    canRoute.attr({ page: 'home', subpage: '', action: '' });
  },
  /**
   * @function toggleCongigurationPanel
   * @parent i2web/components/device/panel
   * Opens up the device assignment configurator in the Side panel.
   */
  toggleAssignmentPanel(thing) {
    const findDeviceForPerson = (person) => {
      return _.find(this.attr('allDevices'), (d) => {
        return d.attr('pres:person') === person.attr('base:address');
      });
    };
    const device = (thing instanceof Person) ? findDeviceForPerson(thing) : thing;
    const attributes = '{(device)}="device" {configurators}="configurators"';
    const template = `{{close-button}}<arcus-device-configuration-panel ${attributes} />`;
    SidePanel.right(template, {
      device,
      configurators: ['assign-device'],
    });
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-home-family',
  viewModel: ViewModel,
  view,
});
