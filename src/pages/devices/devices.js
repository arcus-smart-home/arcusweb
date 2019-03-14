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
import canRoute from 'can-route';
import 'can-map-define';
import Place from 'i2web/models/place';
import Device from 'i2web/models/device';
import Hub from 'i2web/models/hub';
import view from './devices.stache';
import getAppState from 'i2web/plugins/get-app-state';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Hub} hub
     * @parent i2web/pages/devices
     *
     * The Hub at the user's currently selected place.
     */
    hub: {
      Type: Hub,
    },
    /**
     * @property {Device.List} devices
     * @parent i2web/pages/devices
     *
     * The list of devices at the user's currently selected place.
     */
    devices: {
      Type: Device.List,
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/devices
     *
     * The user's currently selected place.
     */
    place: {
      Type: Place,
    },
    /**
     * @property {String} activeDisplay
     * @parent i2web/pages/rules
     * @description the name of the subview being displayed
     */
    activeDisplay: {
      type: 'string',
      get() {
        const defaultView = 'list';
        const viewNames = [defaultView, 'zwave'];
        let routeViewName = canRoute.attr('subpage');
        const page = canRoute.attr('page');

        // set to default view if unset or invalid
        if (page === 'devices' && viewNames.indexOf(routeViewName) === -1) {
          canRoute.attr('subpage', defaultView);
          routeViewName = defaultView;
        }

        return routeViewName;
      },
    },
    /**
     * @property {String} isNoDeviceView
     * @parent i2web/pages/devices
     *
     * If we're showing the no paired devices upsell view.
     */
    isNoDeviceView: {
      get() {
        return this.attr('devices.length') === 0 && !this.attr('hub');
      },
    },
    /**
     * @property {boolean} isZWaveView
     * @parent i2web/pages/devices
     *
     * If we're showing the z-wave tools subview.
     */
    isZWaveView: {
      get() {
        return this.attr('activeDisplay') === 'zwave';
      },
    },
    /**
     * @property {boolean} isDeviceView
     * @parent i2web/pages/devices
     *
     * If we're showing the list of devices subview.
     */
    isDeviceView: {
      get() {
        return this.attr('activeDisplay') !== 'zwave';
      },
    },
    /**
     * @property {boolean} showAddDevice
     * @parent i2web/pages/devices
     * If we're showing the button that begins the pairing process of a new device.
     */
    showAddDevice: {
      get() {
        return !!getAppState().attr('hub');
      },
    },
  },
  /**
   * @function addDevice
   * @parent i2web/pages/devices
   * @param {MouseEvent} ev The mouse click event, only needed for preventing default
   * @description Dismiss the pairing device cart items and send the User to the
   * product catalog
   */
  addDevice() {
    const subsystems = getAppState().attr('subsystems');
    subsystems.findByName('subpairing').DismissAll();

    canRoute.attr({ page: 'product-catalog', subpage: 'brands' });
  },
  setSubpage(page) {
    canRoute.attr('subpage', page);
  },
});

export default Component.extend({
  tag: 'arcus-page-devices',
  viewModel: ViewModel,
  view,
});
