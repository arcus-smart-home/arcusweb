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
import canList from 'can-list';
import 'can-map-define';
import Device from 'i2web/models/device';
import Subsystem from 'i2web/models/subsystem';
import Errors from 'i2web/plugins/errors';
import view from './edit-participation.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Device} device
     * @parent i2web/components/subsystem/alarms/devices/edit-participation
     * @description The device whose participation we are editing
     */
    device: {
      Type: Device,
    },
    /**
     * @property {htmlbool} forPairingCustomization
     * @parent i2web/components/subsystem/alarms/devices/edit-participation
     *
     * Attribute that indicates if the component is being used during pairing customization
     */
    forPairingCustomization: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {Subsystem} clonedSubsystem
     * @parent i2web/components/subsystem/alarms/devices/edit-participation
     * @description The security subsystem
     */
    subsystem: {
      Type: Subsystem,
      set(subsystem) {
        this.attr('clonedSubsystem', subsystem.clone());
        return subsystem;
      },
    },
    /**
     * @property {Subsystem} clonedSubsystem
     * @parent i2web/components/subsystem/alarms/devices/edit-participation
     * @description The a clone of the security subsystem
     */
    clonedSubsystem: {
      Type: Subsystem,
    },
    /**
     * @property {canList} onDevices
     * @parent i2web/components/subsystem/alarms/devices/edit-participation
     * @description The list of all devices fully armed
     */
    onDevices: {
      Type: canList,
      value: [],
      get(lastSetVal) {
        const subsystem = this.attr('clonedSubsystem');

        return lastSetVal.replace(subsystem.attr('subsecuritymode:devices:ON'));
      },
    },
    /**
     * @property {canList} onDevices
     * @parent i2web/components/subsystem/alarms/devices/edit-participation
     * @description The list of all devices partially armed
     */
    partialDevices: {
      Type: canList,
      value: [],
      get(lastSetVal) {
        const subsystem = this.attr('clonedSubsystem');

        return lastSetVal.replace(subsystem.attr('subsecuritymode:devices:PARTIAL'));
      },
    },
    /**
     * @property {Boolean} isOn
     * @parent i2web/components/subsystem/alarms/devices/edit-participation
     * @description Determines whether or not the device will participate only when
     * the security system is fully armed
     */
    isOn: {
      type: 'boolean',
      get() {
        const onDevices = this.attr('onDevices');
        const partialDevices = this.attr('partialDevices');
        const deviceAddress = this.attr('device.base:address');

        return onDevices.indexOf(deviceAddress) !== -1 && partialDevices.indexOf(deviceAddress) === -1;
      },
      set(newVal) {
        const onDevices = this.attr('onDevices');
        const partialDevices = this.attr('partialDevices');
        const deviceAddress = this.attr('device.base:address');

        if (newVal) {
          if (onDevices.indexOf(deviceAddress) === -1) {
            onDevices.push(deviceAddress);
          }
          if (partialDevices.indexOf(deviceAddress) !== -1) {
            partialDevices.splice(partialDevices.indexOf(deviceAddress), 1);
          }
        } else {
          onDevices.splice(onDevices.indexOf(deviceAddress), 1);
        }

        return newVal;
      },
    },
    /**
     * @property {Boolean} isOnAndPartial
     * @parent i2web/components/subsystem/alarms/devices/edit-participation
     * @description Determines whether or not the device will participate both when
     * the security system is fully armed and when it is partially armed
     */
    isOnAndPartial: {
      type: 'boolean',
      get() {
        const onDevices = this.attr('onDevices');
        const partialDevices = this.attr('partialDevices');
        const deviceAddress = this.attr('device.base:address');

        return onDevices.indexOf(deviceAddress) !== -1 && partialDevices.indexOf(deviceAddress) !== -1;
      },
      set(newVal) {
        const onDevices = this.attr('onDevices');
        const partialDevices = this.attr('partialDevices');
        const deviceAddress = this.attr('device.base:address');

        if (newVal) {
          if (onDevices.indexOf(deviceAddress) === -1) {
            onDevices.push(deviceAddress);
          }
          if (partialDevices.indexOf(deviceAddress) === -1) {
            partialDevices.push(deviceAddress);
          }
        } else {
          onDevices.splice(onDevices.indexOf(deviceAddress), 1);
          partialDevices.splice(partialDevices.indexOf(deviceAddress), 1);
        }
        return newVal;
      },
    },
    /**
     * @property {Boolean} isPartial
     * @parent i2web/components/subsystem/alarms/devices/edit-participation
     * @description Determines whether or not the device will participate only when
     * the security system is partially armed
     */
    isPartial: {
      type: 'boolean',
      get() {
        const onDevices = this.attr('onDevices');
        const partialDevices = this.attr('partialDevices');
        const deviceAddress = this.attr('device.base:address');

        return onDevices.indexOf(deviceAddress) === -1 && partialDevices.indexOf(deviceAddress) !== -1;
      },
      set(newVal) {
        const partialDevices = this.attr('partialDevices');
        const onDevices = this.attr('onDevices');
        const deviceAddress = this.attr('device.base:address');

        if (newVal) {
          if (partialDevices.indexOf(deviceAddress) === -1) {
            partialDevices.push(deviceAddress);
          }
          if (onDevices.indexOf(deviceAddress) !== -1) {
            onDevices.splice(onDevices.indexOf(deviceAddress), 1);
          }
        } else {
          partialDevices.splice(partialDevices.indexOf(deviceAddress), 1);
        }
        return newVal;
      },
    },
    /**
     * @property {Boolean} isNotParticipating
     * @parent i2web/components/subsystem/alarms/devices/edit-participation
     * @description Determines whether or not the device will not participate only when
     * the security system is armed in any manner
     */
    isNotParticipating: {
      type: 'boolean',
      get() {
        const onDevices = this.attr('onDevices');
        const partialDevices = this.attr('partialDevices');
        const deviceAddress = this.attr('device.base:address');

        return onDevices.indexOf(deviceAddress) === -1 && partialDevices.indexOf(deviceAddress) === -1;
      },
      set(newVal) {
        const onDevices = this.attr('onDevices');
        const partialDevices = this.attr('partialDevices');
        const deviceAddress = this.attr('device.base:address');

        if (newVal) {
          if (onDevices.indexOf(deviceAddress) !== -1) {
            onDevices.splice(onDevices.indexOf(deviceAddress), 1);
          }
          if (partialDevices.indexOf(deviceAddress) !== -1) {
            partialDevices.splice(partialDevices.indexOf(deviceAddress), 1);
          }
        }
        return newVal;
      },
    },
    /**
    * @property {Boolean} saving
    * @parent i2web/components/subsystem/alarms/devices/edit-participation
    * whether the subsystem is being saved
    */
    saving: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @function saveParticipation
   * @parent i2web/components/subsystem/alarms/devices/edit-participation
   * @description Event handler for saving the device's alarm participation
   */
  saveParticipation() {
    const subsystem = this.attr('subsystem');
    this.attr('saving', true);
    const onDevices = this.attr('onDevices');
    const partialDevices = this.attr('partialDevices');
    subsystem.attr('subsecuritymode:devices:ON').replace(onDevices);
    subsystem.attr('subsecuritymode:devices:PARTIAL').replace(partialDevices);

    subsystem.save()
      .then(() => {
        this.attr('saving', false);

        if (this.onClose !== undefined && typeof this.onClose === 'function') {
          this.onClose();
        }
      })
      .catch((e) => {
        this.attr('saving', false);
        Errors.log(e);
      });
  },
  /**
   * @function _onCancel
   * @parent i2web/components/subsystem/alarms/devices/edit-participation
   * @description Private function. Called when attempting to cancel making changes. Pass in
   * `onCancel` to the component.
   */
  _onCancel() {
    if (this.onClose !== undefined && typeof this.onClose === 'function') {
      this.onClose();
    }
  },

  /**
   * @function onClose
   * @parent i2web/components/subsystem/alarms/devices/edit-participation
   * @description Function that controls what happens when the "Cancel" or "Save" button is clicked.
   * Should be passed in from outside of the component
   */
  onClose: undefined,
});

export default Component.extend({
  tag: 'arcus-subsystems-alarms-devices-edit-participation',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel onDevices} change': function onDevicesChanged() {
      const vm = this.viewModel;
      if (vm.attr('forPairingCustomization')) {
        vm.saveParticipation();
      }
    },
    '{viewModel partialDevices} change': function partialDevicesChanged() {
      const vm = this.viewModel;
      if (vm.attr('forPairingCustomization')) {
        vm.saveParticipation();
      }
    },
  },
});
