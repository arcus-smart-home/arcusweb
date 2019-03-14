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
import Analytics from 'i2web/plugins/analytics';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import { deviceSupportLinkKey } from 'i2web/helpers/device';
import { showDeviceErrorsPanel } from 'i2web/plugins/device';
import view from './panel.stache';
import Device from 'i2web/models/device';
import SidePanel from 'i2web/plugins/side-panel';
import 'i2web/components/device/configuration-panel/';
import 'i2web/components/device/detail-panel/';
import 'i2web/components/device/remove-panel/';

export const ViewModel = canMap.extend({
  define: {
    /**
    * @property {Device} device
    * @parent i2web/components/device/panel
    * The device associated with the panel
    */
    device: {
      Type: Device,
    },
    /**
     * @property {boolean} erroredButNotUpdating
     * @parent i2web/components/device/panel
     * @description Is the device in an error state but not updating its firmware
     */
    erroringNotUpdating: {
      get() {
        const device = this.attr('device');
        return device.attr('erroredState')
          && !device.attr('isFirmwareUpdateInProgress');
      },
    },
    /**
     * @property {htmlbool} focused
     * @parent i2web/components/device/panel
     *
     * Attribute that indicates if the device should be visible at the top of the browser viewport.
     */
    focused: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {boolean} hasComplexErrors
     * @parent i2web/components/device/panel
     *
     * Determines if the device has complex errors that should be displayed in a side panel.
     */
    hasComplexErrors: {
      get() {
        const errors = this.attr('device.erroredState');
        return errors && errors.complexErrors;
      },
    },
    /**
     * @property {boolean} hasWarnings
     * @parent i2web/components/device/panel
     *
     * Determines if a warning icon should be shown next to the device.
     */
    hasWarnings: {
      get() {
        return !this.attr('device.isOffline') && !!(this.attr('device').attr('warnings') || this.attr('device').attr('alertedState'));
      },
    },
    /**
     * @property {boolean} showDisabled
     * @parent i2web/components/device/panel
     *
     * Determines if the device should be shown as disabled (greyed out).
     */
    showDisabled: {
      get() {
        return this.attr('device.isOffline') || this.attr('device.isBlocked');
      },
    },
    /**
     * @property {string} supportLinkKey
     * @parent i2web/components/device/panel
     *
     * Returns an appropriate support link key based on the device's current error status.
     */
    supportLinkKey: {
      get() {
        const device = this.attr('device');
        return deviceSupportLinkKey(device);
      },
    },
  },
  /**
  * @function toggleCongigurationPanel
  * @parent i2web/components/device/panel
  * Puts configuration information in the right side panel
  */
  toggleConfigurationPanel() {
    const tagName = `devices.settings`;
    Analytics.tag(tagName);
    SidePanel.right('{{close-button}}<arcus-device-configuration-panel {(device)}="device"/>', { device: this.compute('device') });
  },
  /**
  * @function toggleDetailsPanel
  * @parent i2web/components/device/panel
  * Puts device details information in the right side panel
  */
  toggleDetailsPanel() {
    const tagName = `devices.more`;
    Analytics.tag(tagName);
    SidePanel.right('{{close-button}}<arcus-device-detail-panel {(device)}="device"></arcus-device-detail-panel>', { device: this.compute('device') });
  },
  /**
  * @function toggleErrorsPanel
  * @parent i2web/components/device/panel
  * @param msgType The type of device error messages to display in the panel, 'warn', 'error' or 'both'
  * Puts device warnings and/or errors in the right side panel
  */
  toggleErrorsPanel(msgType) {
    showDeviceErrorsPanel(this.attr('device'), msgType);
  },
});

export default Component.extend({
  tag: 'arcus-device-panel',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      $('.is-isolating').removeClass('is-isolating');
    },
    '.newProperty focus': function inputIsolate(el) {
      $(el).closest('.panel-list-container').addClass('is-isolating');
    },
    '.newProperty blur': function inputUnIsolate(el) {
      $(el).closest('.panel-list-container').delay(200).removeClass('is-isolating');
    },
  },
});
