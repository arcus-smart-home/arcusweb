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
import config from 'i2web/config';
import view from './configuration-panel.stache';
import Hub from 'i2web/models/hub';
import HubNetworkCapability from 'i2web/models/capability/HubNetwork';
import Notifications from 'i2web/plugins/notifications';
import SidePanel from 'i2web/plugins/side-panel';

export const ViewModel = canMap.extend({
  define: {
    hasWifiCapability: {
      type: 'boolean',
      get() {
        const enableScan = !!parseInt(config.enableHubWifiScan, 10);
        return enableScan && this.attr('hub') && this.attr('hub').hasCapability('hubwifi');
      },
    },
    /**
     * @property {Hub} hub
     * @parent i2web/components/hub/configuration-panel
     *
     * The hub being displayed in the panel
     */
    hub: {
      Type: Hub,
    },
    /**
     * @property {Boolean} isPairing
     * @parent i2web/components/hub/configuration-panel
     *
     * Indicates if the configuration panel is being accessed during hub pairing.
     */
    isPairing: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @function closeConfigurationPanel
   * @parent i2web/components/hub/configuration-panel
   *
   * Callback for Done button
   */
  closeConfigurationPanel() {
    if (this.attr('hub.hubwifi:wifiSsid') && this.attr('hub.hubnet:type') === HubNetworkCapability.TYPE_ETH) {
      Notifications.error('Please unplug the Ethernet cable to complete Wi-Fi setup.');
    }
    SidePanel.close();
  },
});

export default Component.extend({
  tag: 'arcus-hub-configuration-panel',
  viewModel: ViewModel,
  view,
});
