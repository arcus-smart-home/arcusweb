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
import Cornea from 'i2web/cornea/';
import Errors from 'i2web/plugins/errors';
import { FormComponent, FormViewModel, FormEvents } from 'i2web/components/form/';
import view from './wifi-scan.stache';
import _ from 'lodash';
import WifiCapability from 'i2web/models/capability/WiFi';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {CanMap} constraints
     * @parent i2web/components/wifi-scan
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
     * @property {String} formErrorMessage
     * @parent i2web/components/wifi-scan
     * @description Error message associated with failed connection; provide by parent component
     */
    formErrorMessage: {
      type: 'string',
    },
    /**
     * @property {String} lastSavedSsid
     * @parent i2web/components/wifi-scan
     * @description last ssid saved for the device associated with this component
     */
    lastSavedSsid: {
      set(value) {
        if (this.attr('thing').hasCapability('hubwifi')) {
          this.attr('thing.hubwifi:wifiSsid', value);
        } else if (this.attr('thing').hasCapability('wifi')) {
          this.attr('thing.wifi:ssid', value);
        }
        return value;
      },
      get() {
        if (this.attr('thing').hasCapability('hubwifi')) {
          return this.attr('thing.hubwifi:wifiSsid');
        } else if (this.attr('thing').hasCapability('wifi')) {
          return this.attr('thing.wifi:ssid');
        }
        return undefined;
      },
    },
    /**
     * @property {String} networkPassword
     * @parent i2web/components/wifi-scan
     * @description network password for connecting to selectedNetwork
     */
    networkPassword: {
      type: 'string',
    },
    /**
     * @property {Array<Object>} networks
     * @parent i2web/components/wifi-scan
     * @description list of networks fetched in the scan
     */
    networks: {
      value: [],
    },
    /**
     * @property {Function} onConnect
     * @parent i2web/components/wifi-scan
     * @description Function called after platform connection call returns
     */
    onConnect: {
      type: '*',
    },
    /**
     * @property {Boolean} saving
     * @parent i2web/components/wifi-scan
     * @description component state - whether we are actively trying to connect to selectedNetwork or not
     */
    saving: {
      type: 'boolean',
    },
    /**
     * @property {Boolean} securityIsWPA2
     * @parent i2web/components/wifi-scan
     * @description Whether the security type is WPA2
     */
    securityIsWPA2: {
      get() {
        return [WifiCapability.SECURITY_WPA2_PSK, WifiCapability.SECURITY_WPA2_ENTERPRISE].includes(this.attr('selectedSecurity'));
      },
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
     * @property {CanList<CanMap>} securityTypes
     * @parent i2web/components/wifi-scan
     * @description available security types
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
    /**
     * @property {Object} selectedNetwork
     * @parent i2web/components/wifi-scan
     * @description Selected network to connect to
     */
    selectedNetwork: {
      value: null,
    },
    /**
     * @property {String} selectedSecurity
     * @parent i2web/components/wifi-scan
     * @description Security type for selected network
     */
    selectedSecurity: {
      type: 'string',
    },
    /**
     * @property {String} selectedSSID
     * @parent i2web/components/wifi-scan
     * @description Selected SSID, used to set the selected network
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
        const hasWPA2 = _.find(this.attr('selectedNetwork.security').attr(), (t) => {
          return t.toUpperCase().replace(/-/g, '_') === WifiCapability.SECURITY_WPA2_PSK;
        });
        if (hasWPA2) {
          this.attr('selectedSecurity', 'WPA2_PSK');
        } else {
          this.attr('selectedSecurity', this.attr('selectedNetwork.security.0'));
        }
        return ssid;
      },
      get() {
        return this.attr('lastSavedSsid');
      },
    },
    /**
     * @property {Boolean} selectedNetworkKnown
     * @parent i2web/components/wifi-scan
     * @description Whether the selected network was returned from the scan or not
     */
    selectedNetworkKnown: {
      value: true,
    },
    /**
     * @property {Boolean} showSecurityDropdown
     * @parent i2web/components/wifi-scan
     * @description Whether to show the security selector
     */
    showSecurityDropdown: {
      get() {
        return !this.attr('selectedNetworkKnown') || this.attr('selectedNetwork.security.length') > 1;
      },
    },
    /**
     * @property {Boolean} supportLinkKey
     * @parent i2web/components/wifi-scan
     * @description key to use on the link for Don't See your Network
     */
    supportLinkKey: {
      type: 'string',
    },
    /**
     * @property {Model} thing
     * @parent i2web/components/wifi-scan
     * @description the hub or device being used to initiate a network scan
     */
    thing: {
      type: '*',
    },
    /**
     * @property {String} thingWiFiConnect
     * @parent i2web/components/wifi-scan
     * @description the method name used to scan for wifi networks
     */
    thingWiFiConnect: {
      get() {
        if (this.attr('thing')) {
          if (this.attr('thing').hasCapability('hubwifi')) {
            return 'WiFiConnect';
          } else if (this.attr('thing').hasCapability('wifi')) {
            return 'Connect';
          }
        }
        return undefined;
      },
    },
  },
  /**
   * @function changeNetwork
   * @parent i2web/components/wifi-scan
   * @description validates inputs and connects to the selected network
   */
  changeNetwork(vm, el, ev) {
    ev.preventDefault();

    this.attr('formError', false);

    if (!this.formValidates()) {
      ev.stopPropagation();
      return;
    }

    const params = [
      this.attr('selectedNetwork').attr('ssid'),
      this.attr('selectedNetwork').attr('bssid'),
      // security needs to be all uppercase, with dashes replaced with underscores
      this.attr('selectedSecurity').toUpperCase().replace(/-/g, '_'),
      this.attr('networkPassword'),
    ];

    if (!(this.attr('thing') && this.attr('thingWiFiConnect'))) {
      this.attr('formError', true);
      this.attr('formErrorMessage', 'This device cannot be connected via Wi-Fi.');
      return;
    }
    this.attr('saving', true);
    this.attr('thing')[this.attr('thingWiFiConnect')](...params).then((res) => {
      if (res.status !== 'CONNECTING') {
        this.attr('saving', false);
        this.attr('formError', true);
        this.attr('onConnect')(false);
      }
      // else, we'll wait for the results of the connection test
    }).catch((e) => {
      this.attr('formError', true);
      this.attr('saving', false);
      this.attr('onConnect')(false);
      Errors.log(e);
    });
  },
  /**
   * @function clearInputs
   * @parent i2web/components/wifi-scan
   * @description Clears the selected inputs
   */
  clearInputs() {
    this.attr('selectedNetwork', null);
    this.attr('selectedSecurity', null);
    this.attr('networkPassword', '');
  },
  /**
   * @function clearSelectedNetwork
   * @parent i2web/components/wifi-scan
   * @description Clears the selected inputs and resets the form
   */
  clearSelectedNetwork() {
    this.clearInputs();
    this.resetForm();
  },
  /**
   * @function updateConnectionStatus
   * @parent i2web/components/wifi-scan
   * @description Updates the form based on the connection test results
   */
  updateConnectionStatus(connectResult) {
    this.attr('saving', false);
    if (connectResult && connectResult.status === 'OK') {
      this.attr('lastSavedSsid', this.attr('selectedNetwork').attr('ssid'));
      this.attr('networks', []);
      this.clearInputs();
      this.attr('onConnect')(true);
    } else {
      this.attr('formError', true);
      this.attr('onConnect')(false);
    }
  },
});

const events = Object.assign({
  connectResultCallback: null,
  inserted() {
    this.connectResultCallback = this.viewModel.updateConnectionStatus.bind(this.viewModel);
    Cornea.on('hub hubwifi:WiFiConnectResult', this.connectResultCallback);
  },
  removed() {
    if (this.connectResultCallback) {
      Cornea.removeListener('hub hubwifi:WiFiConnectResult', this.connectResultCallback);
    }
  },
}, FormEvents);

export default FormComponent.extend({
  tag: 'arcus-wifi-scan',
  viewModel: ViewModel,
  view,
  events,
});
