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

import CanMap from 'can-map';
import Component from 'can-component';
import 'can-map-define';
import includes from 'lodash/includes';

import Device from 'i2web/models/device';
import view from './motion-sensitivity.stache';

const offSetting = 'OFF';
const sensitivitySettingsOrder = [
  { key: 'OFF', label: 'Off' },
  { key: 'LOW', label: 'Low' },
  { key: 'MED', label: 'Medium' },
  { key: 'HIGH', label: 'High' },
  { key: 'MAX', label: 'Max' },
];

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Device} device
     * @parent i2web/components/device/configurators/motion-sensitivity
     * The device associated with this motion-sensitivity component
     */
    device: {
      Type: Device,
    },
    /**
     * @property {String} deviceSensitivity
     * @parent i2web/components/device/configurators/motion-sensitivity
     * The current sensitivity quality setting of the device
     */
    deviceSensitivity: {
      get() {
        return this.attr('device.mot:sensitivity');
      },
      set(sensitivity) {
        this.attr('device.mot:sensitivity', sensitivity);
        return sensitivity;
      },
    },
    /**
     * @property {Boolean} motionDetectionIsTurnedOn
     * @parent i2web/components/device/configurators/motion-sensitivity
     * Whether the device has motion sensitivity turned on
     */
    motionDetectionIsTurnedOn: {
      get() {
        return this.attr('deviceSensitivity') !== offSetting;
      },
    },
    /**
     * @property {Boolean} turningOffMotionDetection
     * @parent i2web/components/device/configurators/motion-sensitivity
     * Whether the user is trying to turn off motion detection
     */
    turningOffMotionDetection: {
      get() {
        return (
          this.attr('motionDetectionIsTurnedOn') &&
          this.attr('selectedMotionSensitivity') === offSetting
        );
      },
    },
    /**
     * @property {String} selectedMotionSensitivity
     * @parent i2web/components/device/configurators/motion-sensitivity
     * The motion sensitivity value bound to the select input, when the view
     * model is instantiated it gets set to the device setting.
     */
    selectedMotionSensitivity: {
      value: '',
    },
    /**
     * @property {CanList} supportedSensitivitySettings
     * @parent i2web/components/device/configurators/motion-sensitivity
     * List of sensitivity quality settings supported by the device
     */
    supportedSensitivitySettings: {
      get() {
        const supported = this.attr('device.mot:sensitivitiesSupported') || [];
        return sensitivitySettingsOrder
          .filter(setting => includes(supported, setting.key))
          .map(setting => ({
            label: setting.label,
            value: setting.key,
          }));
      },
    },
    title: {
      value: 'True Detect Motion Sensitivity',
    },
  },
  init() {
    this.attr('selectedMotionSensitivity', this.attr('deviceSensitivity'));
  },
  setMotionSensitivity(value) {
    this.attr('deviceSensitivity', value);
    return this.attr('device').save().catch(() => {});
  },
  /**
   * @function turningOffMotionDetection
   * @parent i2web/components/device/configurators/motion-sensitivity
   * Click event handler for the button to confirm turning off motion detection
   */
  turnOffMotionDetection() {
    return this.setMotionSensitivity(offSetting);
  },
  /**
   * @function resetMotionSensitivity
   * @parent i2web/components/device/configurators/motion-sensitivity
   * Click event handler for the button to cancel turning off motion detection
   */
  resetMotionSensitivity() {
    this.attr('selectedMotionSensitivity', this.attr('deviceSensitivity'));
  },
});

/**
 * @module {Component} i2web/components/device/configurators/motion-sensitivity
 * @parent i2web/components/device/configurators
 * @description Motion sensitivity configurator
 * @signature `<arcus-device-configurator-motion-sensitivity/>`
 */
export default Component.extend({
  tag: 'arcus-device-configurator-motion-sensitivity',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel} selectedMotionSensitivity': function settingChanged(vm, evt, newValue) {
      if (newValue !== offSetting) {
        vm.setMotionSensitivity(newValue);
      }
    },
  },
});
