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
import view from './detail-panel.stache';
import Place from 'i2web/models/place';
import Hub from 'i2web/models/hub';
import { formatTime } from 'i2web/helpers/global';
import SidePanel from 'i2web/plugins/side-panel';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} formError
     * @parent i2web/components/hub/detail-panel
     *
     * Contains any errors resulting from a Reboot request
     */
    formError: {
      type: 'string',
    },
    /**
     * @property {Hub} hub
     * @parent i2web/components/hub/detail-panel
     *
     * Hub for which we are currently showing detailed information
     */
    hub: {
      Type: Hub,
    },
    /**
     * @property {boolean} isHubAdv
     * @parent i2web/components/hub/detail-panel
     *
     * Determines if the hub has the hubadv capability.
     */
    isHubAdv: {
      get() {
        const hub = this.attr('hub');
        return hub.hasCapability('hubadv');
      },
    },
    /**
     * @property {String} lastChange
     * @parent i2web/components/hub/detail-panel
     *
     * Determines last change time string for the hub detail panel.
     */
    lastChange: {
      get() {
        const hub = this.attr('hub');
        return (hub && hub.attr('hubconn:lastchange')
          ? formatTime(hub.attr('hubconn:lastchange'), 'MMM DD, YYYY h:mm A')
          : '-');
      },
    },

    /**
     * @property {String} osVersion
     * @parent i2web/components/hub/detail-panel
     *
     * Determines osVersion string for the hub detail panel.
     */
    osVersion: {
      get() {
        const hub = this.attr('hub');
        return (hub && hub.attr('hubadv:osver')
          ? `Arcus V${hub.attr('hubadv:osver')}`
          : '-');
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/hub/detail-panel
     *
     * Place for which we are currently showing detailed information
     */
    place: {
      Type: Place,
    },
    /**
     * @property {boolean} rebootHubDisabled
     * @parent i2web/components/hub/detail-panel
     *
     * Disables the reboot hub button if the hub is offline or there is an operation in progress
     */
    rebootHubDisabled: {
      get() {
        const hub = this.attr('hub');
        return hub.attr('isOffline') ||
          this.attr('rebootHubInProgress') ||
          this.attr('removeHubInProgress');
      },
    },
    /**
     * @property {boolean} rebootHubInProgress
     * @parent i2web/components/hub/detail-panel
     *
     * Indicates that the user initiated a hub reboot request
     */
    rebootHubInProgress: {
      type: 'boolean',
    },
    /**
     * @property {boolean} removeHubDisabled
     * @parent i2web/components/hub/detail-panel
     *
     * Disables the Remove hub button if there is an operation in progress
     */
    removeHubDisabled: {
      get() {
        return this.attr('rebootHubInProgress') ||
          this.attr('removeHubInProgress');
      },
    },
    /**
     * @property {boolean} removeHubInProgress
     * @parent i2web/components/hub/detail-panel
     *
     * Indicates that the user initiated a hub remove request
     */
    removeHubInProgress: {
      type: 'boolean',
    },
    /**
     * @property {boolean} showRemoveForm
     * @parent i2web/components/hub/detail-panel
     * @description Whether or not to show the form for removal
     */
    showRemoveForm: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {String} wirelessCap
     * @parent i2web/components/hub/detail-panel
     *
     * Determines wireless capability string for the hub detail panel.
     */
    wirelessCap: {
      get() {
        const hub = this.attr('hub');
        const hubCaps = hub ? hub.attr('base:caps') : null;

        if (hubCaps) {
          const caps = [];

          _.forEach(hubCaps, function findCaps(cap) {
            if (cap === 'hubzigbee') caps.push('Zigbee');
            else if (cap === 'hubzwave') caps.push('Z-Wave');
            else if (cap === 'hubsercomm') caps.push('Wi-Fi');
          });
          return caps.join(', ');
        }
        return '-';
      },
    },
  },
  /**
   * @function rebootHub
   * @parent i2web/components/hub/detail-panel
   *
   * Reboots the hub
   */
  rebootHub() {
    const hub = this.attr('hub');
    this.attr('formError', '');
    this.attr('rebootHubInProgress', true);
    hub.Reboot().then(() => {
      SidePanel.close();
    }).catch(() => {
      this.attr('formError', 'Failed to reboot.');
      this.attr('rebootHubInProgress', false);
    });
  },
  /**
   * @function removeHub
   * @parent i2web/components/hub/detail-panel
   *
   * Begins hub removal screens
   */
  removeHub() {
    this.attr('showRemoveForm', true);
    this.attr('removeHubInProgress', true);
  },
});

export default Component.extend({
  tag: 'arcus-hub-detail-panel',
  viewModel: ViewModel,
  view,
  helpers: {
    /**
     * @function displayAttribute
     * @parent i2web/components/hub/detail-panel
     * @param {String} attribute
     *
     * @description
     * Determines if the named attribute exists and returns its
     * value; otherwise, returns '-'
     *
     * @return {String} The formatted attribute string to  display
     */
    displayAttribute(attribute) {
      const hub = this.attr('hub');
      return (hub && hub.attr(attribute)
        ? hub.attr(attribute)
        : '-');
    },
  },
});
