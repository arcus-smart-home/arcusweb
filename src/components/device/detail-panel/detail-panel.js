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
import view from './detail-panel.stache';
import Device from 'i2web/models/device';
import Errors from 'i2web/plugins/errors';
import SidePanel from 'i2web/plugins/side-panel';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {String} confirmationText
     * @parent i2web/components/device/detail-panel
     * @description The confirmation text shown prior to removing a device
     */
    confirmationText: {
      get() {
        const device = this.attr('device');
        if (device.attr('isZWave') && device.attr('isBridge')) {
          return 'Removing this parent device will also remove any child devices controlled through it. Do not use other Arcus devices while removing. You may unintentionally remove unrelated devices during the process.';
        }
        if (device.attr('isZWave')) {
          return 'Do not use other Arcus devices while removing. You may unintentionally remove other devices during the process.';
        }
        if (device.attr('isBridge')) {
          return 'Removing this parent device will also remove any child devices controlled through it.';
        }
        return undefined;
      },
    },
    /**
     * @property {Device} device
     * @parent i2web/components/device/detail-panel
     *
     * Device that we are currently showing product information for
     */
    device: {
      Type: Device,
    },
    /**
     * @property {boolean} isConfirmationShown
     * @parent i2web/components/device/detail-panel
     * @description if the cancel confirmation view elements are being shown
     */
    isConfirmationShown: {
      type: 'boolean',
      value: false,
    },

    /**
     * @property {boolean} supportsIdentification
     * @parent i2web/components/device/detail-panel
     * @description if the device supports identification
     */
    supportsIdentification: {
      get() {
        const device = this.attr('device');
        const caps = device ? device.attr('base:caps') : null;

        if (caps) {
          return caps.indexOf('ident') !== -1;
        }

        return false;
      }
    },

    /**
     * @property {boolean} supportsTamper
     * @parent i2web/components/device/detail-panel
     * @description if the device supports tamper information
     */
    supportsTamper: {
      get() {
        const device = this.attr('device');
        const caps = device ? device.attr('base:caps') : null;

        if (caps) {
          return caps.indexOf('tamp') !== -1;
        }

        return false;
      }
    }
  },
  /**
   * @function onPromptClick
   * @parent i2web/components/device/detail-panel
   * @description handler for when the device removal prompt is clicked
   */
  onPromptClick() {
    this.attr('isConfirmationShown', true);
  },
  /**
   * @function onCancelConfirmationClick
   * @parent i2web/components/device/detail-panel
   * @description handler for when the device removal confirmation cancel button is clicked
   */
  onCancelConfirmationClick() {
    this.attr('isConfirmationShown', false);
  },
  /**
   * @function onConfirmationClick
   * @parent i2web/components/device/detail-panel
   * @description handler for when the device removal confirmation button is clicked
   */
  onConfirmationClick() {
    const device = this.attr('device');
    SidePanel.right('<arcus-device-remove-panel {device}="device" />', { device });
  },
  /**
   * @function onIdentifyClick
   * @parent i2web/components/device/detail-panel
   * @description handler for when the device identify button is clicked
   */
  onIdentifyClick() {
    const device = this.attr('device');
    device.Identify().catch(e => Errors.log(e));
  }
});

export default Component.extend({
  tag: 'arcus-device-detail-panel',
  viewModel: ViewModel,
  view,
});
