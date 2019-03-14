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
import Analytics from 'i2web/plugins/analytics';
import SidePanel from 'i2web/plugins/side-panel';
import Errors from 'i2web/plugins/errors';
import Subsystem from 'i2web/models/subsystem';
import AlarmCapability from 'i2web/models/capability/Alarm';
import AppState from 'i2web/plugins/get-app-state';
import view from './settings.stache';
import moment from 'moment';

import 'i2web/components/subsystem/alarms/settings/delays.component';
import 'i2web/components/subsystem/alarms/settings/requirements.component';

const PANEL_ANALYTICS = {
  globalSounds: 'alarms.settings.sounds',
  gracePeriods: 'alarms.settings.grace',
  alarmRequirements: 'alarms.settings.requirements',
};

const SETTINGS_ANALYTICS = {
  securityAndPanicEnabled: 'alarms.settings.sounds.security',
  smokeAndCOEnabled: 'alarms.settings.sounds.smokeco',
  smokecowaterLeakEnabled: 'alarms.settings.sounds.water',
};

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/alarms/settings
     * @description The alarm subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {Subsystem} securitySubsystem
     * @parent i2web/components/subsystem/alarms/settings
     * @description The security subsystem
     */
    securitySubsystem: {
      value() {
        const subsystems = AppState().attr('subsystems');
        return subsystems && subsystems.findByName('subsecurity');
      },
    },
    /**
     * @property {Subsystem} safetySubsystem
     * @parent i2web/components/subsystem/alarms/settings
     * @description The safety subsystem
     */
    safetySubsystem: {
      value() {
        const subsystems = AppState().attr('subsystems');
        return subsystems && subsystems.findByName('subsafety');
      },
    },
    /**
     * @property {boolean} hasParticipatingSensors
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether the place has motion sensors participating in the ON or PARTIAL state
     */
    hasParticipatingSensors: {
      get() {
        const motionParticpatingOn = this.attr('securitySubsystem.subsecuritymode:motionSensorCount:ON');
        const motionParticpatingPartial = this.attr('securitySubsystem.subsecuritymode:motionSensorCount:PARTIAL');
        return motionParticpatingOn > 0 || motionParticpatingPartial > 0;
      },
    },
    /**
     * @property {boolean} hasAnyMotionSensors
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether the place has any motion sensors paired
     */
    hasAnyMotionSensors: {
      get() {
        const devices = AppState().attr('devices');
        return !!_.find(devices || [], device => device.attr('dev:devtypehint') === 'Motion');
      },
    },
    /**
     * @property {boolean} hasNoRelevantDevices
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether the place lacks relevant devices for global alarm settings
     */
    hasNoRelevantDevices: {
      get() {
        return !(this.attr('showAlarmSounds') || this.attr('hasWaterValve'));
      },
    },
    /**
     * @property {boolean} showSecurityAndPanic
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not to show the security and panic switch
     */
    showSecurityAndPanic: {
      get() {
        const securityState = this.attr('subsystem.alarm:alertState:SECURITY');
        const panicState = this.attr('subsystem.alarm:alertState:PANIC');
        return securityState !== AlarmCapability.ALERTSTATE_INACTIVE || panicState !== AlarmCapability.ALERTSTATE_INACTIVE;
      },
    },
    /**
     * @property {boolean} showSmokeAndCO
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not to show the smoke and CO switch
     */
    showSmokeAndCO: {
      get() {
        const smokeState = this.attr('subsystem.alarm:alertState:SMOKE');
        const coState = this.attr('subsystem.alarm:alertState:CO');
        return smokeState !== AlarmCapability.ALERTSTATE_INACTIVE || coState !== AlarmCapability.ALERTSTATE_INACTIVE;
      },
    },
    /**
     * @property {boolean} showWaterLeak
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not to show the water leak switch
     */
    showWaterLeak: {
      get() {
        const waterState = this.attr('subsystem.alarm:alertState:WATER');
        return waterState !== AlarmCapability.ALERTSTATE_INACTIVE;
      },
    },
    /**
     * @property {boolean} showAlarmSounds
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not to show the global alarm sounds panel
     */
    showAlarmSounds: {
      get() {
        return this.attr('showSecurityAndPanic') || this.attr('showSmokeAndCO') || this.attr('showWaterLeak');
      },
    },
    /**
     * @property {boolean} securityAndPanicEnabled
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not both security and panic alarms are noise-makers
     */
    securityAndPanicEnabled: {
      type: 'boolean',
      get() {
        const securitySilent = this.attr('subsystem.alarm:silent:SECURITY');
        const panicSilent = this.attr('subsystem.alarm:silent:PANIC');
        return !(securitySilent && panicSilent);
      },
      set(value) {
        const subsystem = this.attr('subsystem');
        const makeSilent = !value;
        subsystem.attr({
          'alarm:silent:SECURITY': makeSilent,
          'alarm:silent:PANIC': makeSilent,
        });
        window.requestAnimationFrame(() => {
          subsystem.save().catch(e => Errors.log(e));
        });
        return value;
      },
    },
    /**
     * @property {boolean} smokeAndCOEnabled
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not both smoke and CO silent alarms are noise-makers
     */
    smokeAndCOEnabled: {
      type: 'boolean',
      get() {
        const smokeSilent = this.attr('subsystem.alarm:silent:SMOKE');
        const coSilent = this.attr('subsystem.alarm:silent:CO');
        return !(smokeSilent && coSilent);
      },
      set(value) {
        const subsystem = this.attr('subsystem');
        const makeSilent = !value;
        subsystem.attr({
          'alarm:silent:SMOKE': makeSilent,
          'alarm:silent:CO': makeSilent,
        });
        window.requestAnimationFrame(() => {
          subsystem.save().catch(e => Errors.log(e));
        });
        return value;
      },
    },
    /**
     * @property {boolean} waterLeakEnabled
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not the water leak alarm is a noise-maker
     */
    waterLeakEnabled: {
      type: 'boolean',
      get() {
        const waterSilent = this.attr('subsystem.alarm:silent:WATER');
        return !waterSilent;
      },
      set(value) {
        const subsystem = this.attr('subsystem');
        subsystem.attr('alarm:silent:WATER', !value);
        window.requestAnimationFrame(() => {
          subsystem.save().catch(e => Errors.log(e));
        });
        return value;
      },
    },
    /**
     * @property {boolean} securityAlarmSoundsEnabled
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not security alarm grace period sounds are enabled
     */
    securityAlarmSoundsEnabled: {
      get() {
        const securityOnEnabled = this.attr('securitySubsystem.subsecuritymode:soundsEnabled:ON');
        const securityPartialEnabled = this.attr('securitySubsystem.subsecuritymode:soundsEnabled:PARTIAL');
        return securityOnEnabled && securityPartialEnabled;
      },
      set(value) {
        const securitySubsystem = this.attr('securitySubsystem');
        securitySubsystem.attr({
          'subsecuritymode:soundsEnabled:ON': value,
          'subsecuritymode:soundsEnabled:PARTIAL': value,
        });
        window.requestAnimationFrame(() => {
          securitySubsystem.save().catch(e => Errors.log(e));
        });
      },
    },
    /**
     * @property {boolean} hasWaterValve
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not there is a water valve for auto water shutoff
     */
    hasWaterValve: {
      type: 'boolean',
      get() {
        const shutoffValves = this.attr('safetySubsystem.subsafety:waterShutoffValves');
        return shutoffValves && shutoffValves.length;
      },
    },

    /**
     * @property {boolean} fanShutoffOnSmoke
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not security alarm should shut off fans on smoke alarm going off
     */
    fanShutoffOnSmoke: {
      get() {
        return this.attr('subsystem.subalarm:fanShutoffOnSmoke');
      },
      set(value) {
        const subsystem = this.attr('subsystem');
        subsystem.attr('subalarm:fanShutoffOnSmoke', value);
        window.requestAnimationFrame(() => {
          subsystem.save().catch(e => Errors.log(e));
        });
      },
    },

    /**
     * @property {boolean} fanShutoffOnCO
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not security alarm should shut off fans on CO alarm going off
     */
    fanShutoffOnCO: {
      get() {
        return this.attr('subsystem.subalarm:fanShutoffOnCO');
      },
      set(value) {
        const subsystem = this.attr('subsystem');
        subsystem.attr('subalarm:fanShutoffOnCO', value);
        window.requestAnimationFrame(() => {
          subsystem.save().catch(e => Errors.log(e));
        });
      },
    },

    /**
     * @property {boolean} hasAvailableCOAlerts
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether there are any devices to detect CO for fan shutoff toggle
     */
    hasAvailableCOAlerts: {
      get() {
        if (this.attr('subsystem.subalarm:availableAlerts')) {
          return !!_.find(this.attr('subsystem.subalarm:availableAlerts'), (a) => { return a === 'CO'; });
        }
        return false;
      },
    },

    /**
     * @property {boolean} hasAvailableSmokeAlerts
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether there are any devices to detect Smoke for fan shutoff toggle
     */
    hasAvailableSmokeAlerts: {
      get() {
        if (this.attr('subsystem.subalarm:availableAlerts')) {
          return !!_.find(this.attr('subsystem.subalarm:availableAlerts'), (a) => { return a === 'SMOKE'; });
        }
        return false;
      },
    },

    /**
     * @property {boolean} fanShutoffSupported
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether there are appropriate devices to support fan shutoff toggle
     */
    fanShutoffSupported: {
      get() {
        if (this.attr('subsystem.subalarm:fanShutoffSupported')) {
          return this.attr('hasAvailableCOAlerts') || this.attr('hasAvailableSmokeAlerts');
        }
        return false;
      },
    },

    /**
     * @property {boolean} recordingSupported
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether there are appropriate devices to support record on security alarm
     */
    recordingSupported: {
      get() {
        const securityState = this.attr('subsystem.alarm:alertState:SECURITY');
        return this.attr('subsystem.subalarm:recordingSupported') && securityState && securityState !== AlarmCapability.ALERTSTATE_INACTIVE;
      },
    },

    /**
     * @property {boolean} recordOnSecurity
     * @parent i2web/components/subsystem/alarms/settings
     * @description Whether or not we should record on cameras when a security alarm is tripped
     */
    recordOnSecurity: {
      get() {
        return this.attr('subsystem.subalarm:recordOnSecurity');
      },
      set(value) {
        const subsystem = this.attr('subsystem');
        subsystem.attr('subalarm:recordOnSecurity', value);
        window.requestAnimationFrame(() => {
          subsystem.save().catch(e => Errors.log(e));
        });
      },
    },
  },
  AlarmCapability,
  /**
   * @function toggleAlarm
   * @parent i2web/components/subsystem/alarms/settings
   * @param {canMap} controlSwitchVM View Model of the associated `arcus-control-switch` component
   * @description Toggles the state of the alarm attributes, based on the `toggle-attribute` attached
   * to the `arcus-control-switch` component
   */
  toggleAlarm(controlSwitchVM) {
    const attribute = controlSwitchVM.attr('toggleAttribute');
    const settingTag = SETTINGS_ANALYTICS[attribute];
    const value = !this.attr(attribute);
    if (settingTag) {
      Analytics.tag(`${settingTag}.${value ? 'on' : 'off'}`);
    }
    this.attr(attribute, value);
  },
  /**
   * @function toggleSecurityAlarmSound
   * @parent i2web/components/subsystem/alarms/settings
   * @description Toggles the state of the
   */
  toggleSecurityAlarmSounds() {
    const attribute = 'securityAlarmSoundsEnabled';
    this.attr(attribute, !this.attr(attribute));
  },
  /**
   * @function toggleSecurityAlarmSound
   * @parent i2web/components/subsystem/alarms/settings
   * @description Toggles the state of the
   */
  toggleWaterShutOff() {
    const subsystem = this.attr('safetySubsystem');
    const attribute = 'subsafety:waterShutOff';
    const value = !subsystem.attr(attribute);
    subsystem.attr(attribute, value);
    Analytics.tag(`alarms.settings.water.${value ? 'on' : 'off'}`);
    window.requestAnimationFrame(() => {
      subsystem.save().catch(e => Errors.log(e));
    });
  },
  /**
   * @function toggleDelaysPanel
   * @parent i2web/components/subsystem/alarms/settings
   * @description Opens the side panel to displaying the security alarms delay settings
   */
  openDelaysPanel() {
    SidePanel.right(`<arcus-subsystem-alarms-settings-delays {(subsystem)}="subsystem" />`, {
      subsystem: this.attr('securitySubsystem'),
    });
  },
  /**
   * @function toggleRequirementsPanel
   * @parent i2web/components/subsystem/alarms/settings
   * @description Opens the side panel to displaying the security alarms requirements settings
   */
  openRequirementsPanel() {
    SidePanel.right(`<arcus-subsystem-alarms-settings-requirements {(subsystem)}="subsystem" />`, {
      subsystem: this.attr('securitySubsystem'),
    });
  },
  /**
   * @function manageDevices
   * @parent i2web/components/subsystem/alarms/settings
   * @description Open the side panel so that User can manage their security devices
   */
  manageDevices() {
    SidePanel.right(`<arcus-subsystem-alarms-devices-security {(subsystem)}="subsystem" />`, {
      subsystem: this.attr('securitySubsystem'),
    });
  },
  /**
   * @function onAccordionPanelToggle
   * @parent i2web/components/subsystem/alarms/settings
   * @description Callback for the accordion panel collapse/expand
   */
  onAccordionPanelToggle(panel) {
    const actionTag = PANEL_ANALYTICS[panel.attr('action')];
    if (panel.attr('active') && actionTag) {
      Analytics.tag(actionTag);
    }
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-alarms-settings',
  viewModel: ViewModel,
  view,
  helpers: {
    /**
     * @function formatSeconds
     * @parent i2web/components/subsystem/alarms/settings
     * @param {Number} seconds = 0 Seconds to format
     * @description Formats a given number of seconds into an `X min XX sec` format
     */
    formatSeconds(seconds = 0) {
      const duration = moment.duration(seconds, 'seconds');
      const min = duration.minutes();
      const sec = duration.seconds();

      return `${min ? `${min} min` : ''} ${sec ? `${sec} sec` : ''}`;
    },
  },
});
