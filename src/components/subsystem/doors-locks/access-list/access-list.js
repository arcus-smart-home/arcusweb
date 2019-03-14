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
import Subsystem from 'i2web/models/subsystem';
import view from './access-list.stache';
import Place from 'i2web/models/place';
import Device from 'i2web/models/device';
import Person from 'i2web/models/person';
import SidePanel from 'i2web/plugins/side-panel';
import _isEmpty from 'lodash/isEmpty';
import getAppState from 'i2web/plugins/get-app-state';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/doors-locks/access-list
     * @description The doors and locks subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/doors-locks/access-list
     * @description The active place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Object} authorizationsByLock
     * @parent i2web/components/subsystem/doors-locks/access-list
     * @description List of authorizations based on the device
     */
    authorizationsByLock: {
      get() {
        return this.attr('subsystem').attr('subdoorsnlocks:authorizationByLock');
      },
    },
    /**
     * @property {Boolean} hasAuthorizationsByLock
     * @parent i2web/components/subsystem/doors-locks/access-list
     * @description Checks if there are any authorizations for this subsystem
     */
    hasAuthorizationsByLock: {
      get() {
        return !_isEmpty(this.attr('authorizationsByLock'));
      },
    },
    /**
     * @property {array} allDevices
     * @parent i2web/components/subsystem/doors-locks/access-list
     * @description An array of map with devices and all the authorized and unauthorized persons
     */
    allDevices: {
      get() {
        const authorizations = _isEmpty(this.attr('authorizationsByLock').attr()) ? false : this.attr('lockDevices');
        const devices = [];
        if (authorizations) {
          authorizations.each((device) => {
            devices.push({
              device,
              authorized: this.authorizedPersonsForDevice(device),
              unauthorized: this.unauthorizedPersonsForDevice(device),
            });
          });
        }
        return devices.sort((a, b) => {
          return (a.device.attr('dev:name') > b.device.attr('dev:name')) ? 1 : -1;
        });
      },
    },
    /**
     * @property {canList} lockDevices
     * @parent i2web/components/subsystem/doors-locks/access-list
     * @description A list of lock devices
     */
    lockDevices: {
      get() {
        return this.attr('subsystem.subdoorsnlocks:lockDevices').map((deviceId => new Device({ 'base:address': deviceId })));
      },
    },
  },
  /**
   * @function toggleFlag
   * @parent i2web/components/subsystem/doors-locks/access-list
   * @param {Device} device The device that needs to be toggled on
   * @param {Object} auth the current auth state of the person and device
   * @param {Object} ev The event object
   * @description Toggles whether or not the person in the should be authorized or unauthorized for the device
   */
  toggleFlag(device, auth, event) {
    event.preventDefault();

    this.attr('device', device);
    const operation = auth.state === 'AUTHORIZED' ? 'DEAUTHORIZE' : 'AUTHORIZE';
    const LockAuthorizationOperation = {
      person: auth.person.attr('base:address'),
      operation,
    };
    this.attr('subsystem').AuthorizePeople(device.attr('base:address'), [LockAuthorizationOperation]).catch((e) => {
      console.warn('An error occured', e);
    });
  },
  /**
   * @function addPerson
   * @parent i2web/components/subsystem/doors-locks/access-list
   * @description Opens sidebar with add person form
   */
  addPerson() {
    const template = `<arcus-settings-people-add-person {inviter}="inviter" {place}="place" />`;
    SidePanel.right(template, {
      inviter: getAppState().compute('person'),
      place: this.compute('place'),
    });
  },
  /**
   * @function authorizedPersonsForDevice
   * @parent i2web/components/subsystem/doors-locks/access-list
   * @param {Device} device The device that needs to be checked against
   * @description Returns an array of persons that are authorized for that device
   */
  authorizedPersonsForDevice(device) {
    const authorized = this.attr(`authorizationsByLock.${device.attr('base:address')}`);
    const data = [];
    if (this.attr('hasAuthorizationsByLock') && authorized) {
      authorized.each((auth) => {
        if (auth.state === 'AUTHORIZED' || auth.state === 'PENDING') {
          data.push({
            person: new Person({ 'base:address': auth.person }),
            state: auth.state,
          });
        }
      });
    }
    return data;
  },
  /**
   * @function unauthorizedPersonsForDevice
   * @parent i2web/components/subsystem/doors-locks/access-list
   * @param {Device} device The device that needs to be checked against
   * @description Returns an array of persons that are unauthorized for that device
   */
  unauthorizedPersonsForDevice(device) {
    const authorized = this.attr(`authorizationsByLock.${device.attr('base:address')}`);
    const data = [];
    if (this.attr('hasAuthorizationsByLock') && authorized) {
      authorized.each((auth) => {
        if (auth.state === 'UNAUTHORIZED') {
          data.push({
            person: new Person({ 'base:address': auth.person }),
            state: auth.state,
          });
        }
      });
    }
    return data;
  },
  /**
   * @function selectedDevice
   * @parent i2web/components/subsystem/doors-locks/access-list
   * @param panel The active panel
   * @description Update the current device based on selected panel
   */
  selectedDevice(panel) {
    this.attr('currentDevice', panel.attr('device'));
  },
  /**
   * @function isPanelActive
   * @parent i2web/components/subsystem/doors-locks/access-list
   * @param panel The panel in question, in this instance an accordian item
   * @description Check to see if the accordian item matches up to the what
   * panel should be active based on the curent device
   */
  isPanelActive(device) {
    return this.attr('currentDevice') && this.attr('currentDevice') === device.attr('base:address');
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-doors-locks-access-list',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel.subsystem.subdoorsnlocks:authorizationByLock} change': function authorizationByLockUpdated(newAuthorizationByLock) {
      this.viewModel.attr('authorizationsByLock', newAuthorizationByLock);
    },
  },
});
