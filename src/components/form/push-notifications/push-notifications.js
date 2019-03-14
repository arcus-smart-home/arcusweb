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

import $ from 'jquery';
import canList from 'can-list';
import canMap from 'can-map';
import 'can-map-define';
import Component from 'can-component';
import view from './push-notifications.stache';
import Person from 'i2web/models/person';
import MobileDevice from 'i2web/models/mobile-device';
import SidePanel from 'i2web/plugins/side-panel';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Person} person
     * @parent i2web/components/form/push-notifications
     * @description The person that has the mobile devices, used for remove devices
     */
    person: {
      Type: Person,
    },
    /**
     * @property {MobileDevice.List} mobileDevices
     * @parent i2web/components/form/push-notifications
     * @description The list of the Person's mobile devices
     */
    mobileDevices: {
      Type: MobileDevice.List,
    },
    /**
     * @property {CanList} removedDevices
     * @parent i2web/components/form/push-notifications
     * @description The list of MobileDevices that will be removed from the Person
     */
    removedDevices: {
      Value: canList,
    },
  },
  /**
   * @property {boolean} saving
   * @parent i2web/components/form/push-notifications
   * Whether the form is in a saving state
   */
  saving: false,
  /**
   * @function formValidates
   * @parent i2web/components/form/push-notifications
   * @return {boolean} Whether the form validates (can be submitted)
   */
  formValidates() {
    return !!this.attr('removedDevices').attr('length');
  },
  /**
   * @function removeFromList
   * @parent i2web/components/form/push-notifications
   * @param {canMap} mobileDevice represents a mobile device
   * @param {Element} el Element that was clicked on
   *
   * Removes a mobile device from the list
   */
  removeFromList(mobileDevice, el) {
    this.attr('removedDevices').push(mobileDevice);
    $(el).closest('li').addClass('removed');
  },
  /**
   * @function removeFromList
   * @parent i2web/components/form/push-notifications
   *
   * Removes each mobile device flagged for removal
   */
  deleteDevices(vm, el, ev) {
    ev.preventDefault();
    const removeDevicePromises = [];
    this.attr('saving', true);
    this.attr('removedDevices').each((device) => {
      removeDevicePromises.push(this.attr('person').RemoveMobileDevice(device['mobiledevice:deviceIndex']));
    });
    Promise.all(removeDevicePromises).then(() => {
      this.attr('saving', false);
      SidePanel.close();
    })
    .catch((e) => {
      this.attr('saving', false);
      this.attr('formError', e);
    });
  },
});

export default Component.extend({
  tag: 'arcus-form-push-notifications',
  viewModel: ViewModel,
  view,
});
