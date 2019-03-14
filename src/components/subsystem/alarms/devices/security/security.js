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
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import { deviceNameSorter } from 'i2web/plugins/sorters';
import { formatDate, formatTime } from 'i2web/helpers/global';
import Device from 'i2web/models/device';
import getAppState from 'i2web/plugins/get-app-state';
import AlarmSubsystemCapability from 'i2web/models/capability/AlarmSubsystem';
import view from './security.stache';
import _startCase from 'lodash/startCase';
import _difference from 'lodash/difference';
import _uniq from 'lodash/uniq';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Subsystem} alarmSubsystem
     * @parent i2web/components/subsystem/alarms/devices/security
     * @description The alarm subsystem
     */
    alarmSubsystem: {
      get() {
        const subsystems = getAppState().attr('subsystems');
        return subsystems && subsystems.findByName('subalarm');
      },
    },
    /**
     * @property {Subsystem} securitySubsystem
     * @parent i2web/components/subsystem/alarms/devices/security
     * @description The security subsystem
     */
    securitySubsystem: {
      get() {
        const subsystems = getAppState().attr('subsystems');
        return subsystems && subsystems.findByName('subsecurity');
      },
    },
    /**
     * @property {Boolean} isArmed
     * @parent i2web/components/subsystem/alarms/devices/security
     * @description Whether or not the alarm subsystem is armed
     */
    isArmed: {
      get() {
        const mode = this.attr('alarmSubsystem.subalarm:securityMode');
        return [AlarmSubsystemCapability.SECURITYMODE_ON, AlarmSubsystemCapability.SECURITYMODE_PARTIAL].includes(mode);
      },
    },
    /**
     * @property {Device.List} bypassedDevices
     * @parent i2web/components/subsystem/alarms/devices/security
     * @description The list of devices that will be bypassed when the alarm is armed
     */
    bypassedDevices: {
      Value: Device.List,
      get(lastSetVal) {
        const alarmSubsystem = this.attr('alarmSubsystem');
        const excludedDevices = alarmSubsystem.attr('alarm:excludedDevices:SECURITY');
        const offlineDevices = alarmSubsystem.attr('alarm:offlineDevices:SECURITY');

        excludedDevices.attr('length');
        offlineDevices.attr('length');

        const bypassedDevices = _difference(excludedDevices, offlineDevices);
        const allDevices = getAppState().attr('devices');
        if (allDevices && bypassedDevices.length) {
          return lastSetVal.replace(allDevices.filter(device => bypassedDevices.includes(device.attr('base:address'))).sort(deviceNameSorter));
        }
        return lastSetVal.replace([]);
      },
    },
    /**
     * @property {Device.List} onPartialDevices
     * @parent i2web/components/subsystem/alarms/devices/security
     * @description The list of devices that are either participating when the alarm is either fully
     * or partially armed
     */
    onPartialDevices: {
      Value: Device.List,
      get(lastSetVal) {
        const securitySubsystem = this.attr('securitySubsystem');
        const alarmSubsystem = this.attr('alarmSubsystem');
        const onDevices = securitySubsystem.attr('subsecuritymode:devices:ON');
        const partialDevices = securitySubsystem.attr('subsecuritymode:devices:PARTIAL');
        const excludedDevices = alarmSubsystem.attr('alarm:excludedDevices:SECURITY');
        const offlineDevices = alarmSubsystem.attr('alarm:offlineDevices:SECURITY');
        let onPartialDevices = _uniq([...onDevices, ...partialDevices]);

        excludedDevices.attr('length');
        offlineDevices.attr('length');
        onDevices.attr('length');
        partialDevices.attr('length');

        // If the system is armed, we need to also remove the bypassed devices, which are
        // excluded but not offline devices.
        if (this.attr('isArmed')) {
          onPartialDevices = _difference(onPartialDevices, _difference(excludedDevices, offlineDevices));
        }

        const allDevices = getAppState().attr('devices');
        if (allDevices && onPartialDevices.length) {
          return lastSetVal.replace(allDevices.filter(device => onPartialDevices.includes(device.attr('base:address'))).sort(deviceNameSorter));
        }
        return lastSetVal.replace([]);
      },
    },
    /**
     * @property {Device.List} notParticipatingDevices
     * @parent i2web/components/subsystem/alarms/devices/security
     * @description The list of devices that are not participating when the alarm armed
     */
    notParticipatingDevices: {
      Value: Device.List,
      get(lastSetVal) {
        let onPartialDevices = this.attr('onPartialDevices');

        if (onPartialDevices) {
          onPartialDevices = onPartialDevices.map(device => device.attr('base:address'));
        } else {
          onPartialDevices = [];
        }

        const alarmDevices = this.attr('alarmSubsystem.alarm:devices:SECURITY');
        const excludedDevices = this.attr('alarmSubsystem.alarm:excludedDevices:SECURITY');
        const offlineDevices = this.attr('alarmSubsystem.alarm:offlineDevices:SECURITY');

        let notParticipatingDevices = _difference(alarmDevices, onPartialDevices);

        // If the system is armed, we need to also remove the bypassed devices, which are
        // excluded but not offline devices.
        if (this.attr('isArmed')) {
          notParticipatingDevices = _difference(notParticipatingDevices, _difference(excludedDevices, offlineDevices));
        }

        alarmDevices.attr('length');
        excludedDevices.attr('length');
        offlineDevices.attr('length');

        const allDevices = getAppState().attr('devices');
        if (allDevices && notParticipatingDevices.length) {
          return lastSetVal.replace(allDevices.filter(device => notParticipatingDevices.includes(device.attr('base:address'))).sort(deviceNameSorter));
        }
        return lastSetVal.replace([]);
      },
    },
    /**
     * @property {Boolean} panelExpanded
     * @parent i2web/components/subsystem/alarms/devices/security
     * @description Whether the side panel is double width
     */
    panelExpanded: {
      type: 'boolean',
      value: false,
      set(expanded) {
        $('.panel-container')[(expanded) ? 'addClass' : 'removeClass']('is-double');
        return expanded;
      },
    },

    /**
     * @property {String} type
     * @parent i2web/components/subsystem/alarms/devices/security
     * @description The type of devices that will be listed. Should be security
     */
    type: {
      type: 'string',
      value: 'security',
    },

    /**
     * @property {String} typeTitle
     * @parent i2web/components/subsystem/alarms/devices/security
     * @description The stylized name of the title.
     */
    typeTitle: {
      type: 'string',
      get() {
        const type = this.attr('type');

        return _startCase(type);
      },
    },
  },
  /**
   * @function expandAndEdit
   * @parent i2web/components/subsystem/alarms/devices/security
   * @param {Device} device The device to select
   * @param {Element} element The element clicked
   * @description Click handler that expands the panel and sets the selected device to edit alarm participation
   */
  expandAndEdit(device, element) {
    $('i.chevron-btn').removeClass('active');
    if ($(element).is('i')) {
      $(element).addClass('active');
    } else if ($(element).find('i.chevron-btn')) {
      $(element).find('i.chevron-btn').addClass('active');
    }
    this.attr('panelExpanded', true);

    this.attr('selectedDevice', device);
  },
  /**
   * @function collapseRightPanel
   * @parent i2web/components/subsystem/alarms/devices/security
   * @description Collapses the right panel
   */
  collapseRightPanel() {
    $('i.chevron-btn').removeClass('active');
    this.attr('panelExpanded', false);
    this.removeAttr('selectedDevice');
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-alarms-devices-security',
  viewModel: ViewModel,
  view,
  helpers: {
    /**
     * @function latestActivityFor
     * @parent i2web/components/subsystem/alarms/devices/security
     * @param {Device} device The device to check
     * @description Helper that will render the latest activity on a device. Should render either
     * motion or open state iwth the time it occurred if it exists, otherwise nothing at all.
     */
    latestActivityFor(device) {
      const isOpen = device.attr('isOpen');
      const isObstructed = device.attr('isObstructed');
      const openState = isOpen ? 'Opened' : 'Closed';
      if (device.hasCapability('mot')) {
        return `Motion: ${formatDate(device.attr('mot:motionchanged'))} ${formatTime(device.attr('mot:motionchanged'))}`;
      } else if (device.hasCapability('cont')) {
        return `${openState}: ${formatDate(device.attr('cont:contactchanged'))} ${formatTime(device.attr('cont:contactchanged'))}`;
      } else if (device.hasCapability('motdoor')) {
        return `${isObstructed ? 'Obstructed' : openState}: ${formatDate(device.attr('motdoor:doorstatechanged'))} ${formatTime(device.attr('motdoor:doorstatechanged'))}`;
      }

      return '';
    },
    /**
     * @function latestActivityFor
     * @parent i2web/components/subsystem/alarms/devices/security
     * @param {Device} device The device to check
     * @description Helper that will render how the device is armed. Will return either On, Partial,
     * or On & Partial
     */
    armedStatusFor(device) {
      const securitySubsystem = this.attr('securitySubsystem');
      const onDevices = securitySubsystem.attr('subsecuritymode:devices:ON');
      const partialDevices = securitySubsystem.attr('subsecuritymode:devices:PARTIAL');
      const isOn = onDevices.indexOf(device.attr('base:address')) !== -1;
      const isPartial = partialDevices.indexOf(device.attr('base:address')) !== -1;

      if (isOn && isPartial) {
        return 'On &amp; Partial';
      } else if (isOn) {
        return 'On';
      } else if (isPartial) {
        return 'Partial';
      }

      return '';
    },
  },
});
