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

import canMap from 'can-map';
import 'can-map-define';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import view from './wifiScan.stache';
import Device from 'i2web/models/device';
import Cornea from 'i2web/cornea/';
import _ from 'lodash';
import WifiCapability from 'i2web/models/capability/WiFi';
import Errors from 'i2web/plugins/errors';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/device/configurators/wifiScan
     *
     * @description Form validation constraints, keyed by field name
     */
    constraints: {
      get() {
        return new canMap({
          'selectedNetwork.ssid': {
            presence: true,
          },
          selectedSecurity: {
            presence: true,
          },
          networkPassword: {
            // When security is NONE, password is not required
            presence: this.attr('securityRequired'),
          },
        });
      },
    },
    /**
     * @property {Device} device
     * @parent i2web/components/device/configurators/wifiScan
     * device
     */
    device: {
      Type: Device,
    },
    /**
     * @property {String} currentNetwork
     * @parent i2web/components/device/configurators/wifiScan
     * Current Wi-Fi network configured for device
     */
    currentNetwork: {
      get() {
        if (this.attr('device.isOffline')) {
          return 'Unknown';
        }
        return this.attr('device.wifi:ssid') || 'None';
      },
    },
    /**
     * @property {Device} introText
     * @parent i2web/components/device/configurators/wifiScan
     * Text displayed as introduction to scan operation
     */
    introText: {
      get() {
        if (this.attr('formError') || this.attr('saving')) {
          return '';
        } else if (this.attr('waitingForSelection')) {
          return 'When choosing a Wi-Fi network, ensure that you connect your Camera and Hub to the same home network.';
        }
        const ethernet = this.attr('onEthernet');
        const ssid = this.attr('device.wifi:ssid');
        const part1 = ethernet ? 'You are currently using Ethernet. ' : '';
        const part2 = ssid ?
          `Unplug the cable from the back of your Camera to start using the <strong><em>${ssid}</em></strong>  Wi-Fi network. P` :
          'If you would like to use Wi-Fi, p';
        return `${part1}${ethernet ? part2 : 'P'}ress Scan to change your Wi-Fi setting.`;
      },
    },
    /**
     * @property {boolean} onEthernet
     * @parent i2web/components/device/configurators/wifiScan
     * indicates if device is currently connected via Ethernet
     */
    onEthernet: {
      get() {
        return (this.attr('device.wifi:state') || '').toLowerCase() === WifiCapability.STATE_DISCONNECTED.toLowerCase();
      },
    },
    /**
     * @property {Array<Object>} networks
     * @parent i2web/components/device/configurators/wifiScan
     * list of networks fetched in the scan
     */
    networks: {
      value: [],
      set(networks) {
        networks.attr('comparator', 'ssid');
        return networks;
      },
    },
    /**
     * @property {Object} selectedNetwork
     * @parent i2web/components/device/configurators/wifiScan
     * selected network to connect to
     */
    selectedNetwork: {
      value: null,
    },
    /**
     * @property {boolean} selectedNetworkKnown
     * @parent i2web/components/device/configurators/wifiScan
     * Whether the selected network was returned from the scan or not
     */
    selectedNetworkKnown: {
      value: true,
    },
    /**
     * @property {boolean} securityRequired
     * @parent i2web/components/device/configurators/wifiScan
     * Whether a password is required or not
     */
    securityRequired: {
      get() {
        return (this.attr('selectedSecurity') || 'NONE').toUpperCase() !== WifiCapability.SECURITY_NONE;
      },
    },
    /**
     * @property {boolean} securityIsWPA2
     * @parent i2web/components/device/configurators/wifiScan
     * Whether the security type is WPA2
     */
    securityIsWPA2: {
      get() {
        return [WifiCapability.SECURITY_WPA2_PSK, WifiCapability.SECURITY_WPA2_ENTERPRISE].includes(this.attr('selectedSecurity'));
      },
    },
    /**
     * @property {boolean} showSecurityDropdown
     * @parent i2web/components/device/configurators/wifiScan
     * Whether to show the security selector
     */
    showSecurityDropdown: {
      get() {
        return !this.attr('selectedNetworkKnown') || this.attr('selectedNetwork.security.length') > 1;
      },
    },
    /**
     * @property {string} selectedSSID
     * @parent i2web/components/device/configurators/wifiScan
     * selected SSID, used to set the selected network
     */
    selectedSSID: {
      set(ssid) {
        let network;
        if (ssid === '_other') {
          this.attr('selectedNetworkKnown', false);
          network = {
            ssid: '',
            security: [WifiCapability.SECURITY_WPA2_PSK],
          };
        } else {
          this.attr('selectedNetworkKnown', true);
          network = _.find(this.attr('networks'), { ssid });
        }
        this.attr('selectedNetwork', network);
        this.attr('selectedSecurity', this.attr('selectedNetwork.security.0'));
        return ssid;
      },
      get() {
        return this.attr('device.wifi:ssid');
      },
    },
    /**
     * @property {string} selectedSecurity
     * @parent i2web/components/device/configurators/wifiScan
     * security type for selected network
     */
    selectedSecurity: {
      type: 'string',
    },
    /**
     * @property {string} networkPassword
     * @parent i2web/components/device/configurators/wifiScan
     * network password for connecting to selectedNetwork
     */
    networkPassword: {
      type: 'string',
    },
    /**
     * @property {boolean} scanVisible
     * @parent i2web/components/device/configurators/wifiScan
     * component state - whether we can scan for networks
     */
    scanVisible: {
      get() {
        return (this.attr('scanningForNetworks') ||
                !this.attr('networks') || this.attr('networks').attr('length') === 0);
      },
    },
    /**
     * @property {boolean} scanningForNetworks
     * @parent i2web/components/device/configurators/wifiScan
     * component state - whether we are scanning for networks or not currently
     */
    scanningForNetworks: {
      value: false,
    },
    /**
     * @property {boolean} waitingForSelection
     * @parent i2web/components/device/configurators/wifiScan
     * component state - whether user has scanned for networks and UI is now waiting for their selection
     */
    waitingForSelection: {
      value: false,
    },
    /**
     * @property {boolean} saving
     * @parent i2web/components/device/configurators/wifiScan
     * component state - whether we are actively trying to connect to selectedNetwork or not
     */
    saving: {
      value: false,
    },
    /**
     * @property {CanList<CanMap>} securityTypes
     * @parent i2web/components/device/configurators/wifiScan
     * available security types
     */
    securityTypes: {
      value: [{
        name: 'None',
        value: WifiCapability.SECURITY_NONE,
      }, {
        name: 'WEP',
        value: WifiCapability.SECURITY_WEP,
      }, {
        name: 'WPA PSK',
        value: WifiCapability.SECURITY_WPA_PSK,
      }, {
        name: 'WPA2 PSK',
        value: WifiCapability.SECURITY_WPA2_PSK,
      }, {
        name: 'WPA Enterprise',
        value: WifiCapability.SECURITY_WPA_ENTERPRISE,
      }, {
        name: 'WPA2 Enterprise',
        value: WifiCapability.SECURITY_WPA2_ENTERPRISE,
      }],
    },
  },
  title: 'Wi-Fi and Network Security',
  /**
   * @function scanForNetworks
   * @parent i2web/components/device/configurators/wifiScan
   * Initializes a scan for wireless networks
   */
  scanForNetworks() {
    this.clearSelectedNetwork();
    this.attr('waitingForSelection', false);
    this.attr('scanningForNetworks', true);
    this.attr('device').StartWifiScan(30);

    Cornea.on('dev wifiscan:WiFiScanResults', ({ scanResults }) => {
      this.attr('networks', scanResults);
      this.attr('scanningForNetworks', false);
      this.attr('waitingForSelection', true);
    });
  },
  /**
   * @function clearSelectedNetwork
   * @parent i2web/components/device/configurators/wifiScan
   * clears the selected network
   */
  clearSelectedNetwork(vm, el, ev) {
    if (ev) {
      ev.preventDefault();
    }
    this.attr('selectedNetwork', null);
    this.attr('selectedSecurity', null);
    this.attr('networkPassword', '');
    this.resetForm();
  },
  /**
   * @function changeNetwork
   * @parent i2web/components/device/configurators/wifiScan
   * connects to the selected network
   */
  changeNetwork(vm, el, ev) {
    ev.preventDefault();

    this.attr('formError', false);

    if (!this.formValidates()) {
      ev.stopPropagation();
      return;
    }

    this.attr('saving', true);
    const params = [
      this.attr('selectedNetwork').attr('ssid'),
      this.attr('selectedNetwork').attr('bssid'),
      // security needs to be all uppercase, with dashes replaced with underscores
      this.attr('selectedSecurity').toUpperCase().replace(/-/g, '_'),
      this.attr('networkPassword'),
    ];
    this.attr('device').Connect(...params).then((res) => {
      this.attr('saving', false);
      if (res.status && res.status === 'OK') {
        // the valueChange for this is often delayed, so change it locally immediately
        this.attr('device.wifi:ssid', this.attr('selectedNetwork').attr('ssid'));

        this.attr('networks', []);
        this.attr('selectedNetwork', null);
        this.attr('selectedSecurity', null);
        this.attr('networkPassword', '');
        this.attr('waitingForSelection', false);
      } else {
        this.attr('formError', true);
      }
    })
    .catch((e) => {
      this.attr('formError', true);
      this.attr('saving', false);
      Errors.log(e);
    });
  },
});

export default FormComponent.extend({
  tag: 'arcus-device-configurator-wifiscan',
  viewModel: ViewModel,
  view,
});
