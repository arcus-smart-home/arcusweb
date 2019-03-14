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

/**
 * @module i2web/app/plugins/device Device
 * @parent app.plugins
 * @description Shared library functions related to Devices
 */
import 'i2web/components/device/error-panel/';
import SidePanel from 'i2web/plugins/side-panel';

/**
 * @function showDeviceErrorsPanel
 * @parent i2web/plugins/device
 * @param {Device} device The device to retrieve related properties from
 * @param {String} msgType The type of messages to display ('warn', 'error', 'both')
 * @description Puts device warnings and/or errors in the right side panel
 */
export function showDeviceErrorsPanel(device, msgType) {
  SidePanel.right('<arcus-device-error-panel {(device)}="device" {(msg-type)}="msgType" />', {
    device,
    msgType,
  });
}

export default {
  showDeviceErrorsPanel,
};
