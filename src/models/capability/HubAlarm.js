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

import Bridge from 'i2web/cornea/bridge';

import Cornea from 'i2web/cornea/';

/**
 * @module {Object} i2web/models/HubAlarm HubAlarm
 * @parent app.models.capabilities
 *
 * Hub alarm subsystem.
 */
export default {
  writeableAttributes: [
    /**
     * @property {boolean} hubalarm\:panicSilent
     *
     * When true only notifications will be sent, alert devices / keypads will not sound.
     *
     */
    'hubalarm:panicSilent',
    /**
     * @property {boolean} hubalarm\:smokeSilent
     *
     * When true only notifications will be sent, alert devices / keypads will not sound.
     *
     */
    'hubalarm:smokeSilent',
    /**
     * @property {boolean} hubalarm\:coSilent
     *
     * When true only notifications will be sent, alert devices / keypads will not sound.
     *
     */
    'hubalarm:coSilent',
    /**
     * @property {boolean} hubalarm\:waterSilent
     *
     * When true only notifications will be sent, alert devices / keypads will not sound.
     *
     */
    'hubalarm:waterSilent',
  ],
  methods: {
    /**
     * @function Activate
     *
     * Puts the hub local alarm into an &#x27;active&#x27; state.
     *
     * @return {Promise}
     */
    Activate() {
      return Bridge.request('hubalarm:Activate', this.GetDestination(), {});
    },
    /**
     * @function Suspend
     *
     * Puts the subsystem into a &#x27;suspended&#x27; state.
     *
     * @return {Promise}
     */
    Suspend() {
      return Bridge.request('hubalarm:Suspend', this.GetDestination(), {});
    },
    /**
     * @function Arm
     *
     * Attempts to arm the alarm into the requested mode, if successful it will return the delay until the alarm is armed.  If this call is repeated with the alarm is in the process of arming with the same mode, it will return the remaining seconds until the alarm is armed (making retries safe).  If this call is invoked with a new mode while the alarm is arming an error will be returned.  If this call is invoked while the alarm is arming with bypassed devices it will return an error.
     *
     * @param {enum} mode The mode the alarm is being armed in
     * @param {boolean} bypassed True if arming in bypass mode
     * @param {int} entranceDelaySecs The amount of time an alarm device must be triggering for before the alarm is fired.&lt;br/&gt;&lt;b&gt;Default: 30&lt;/b&gt;
     * @param {int} exitDelaySecs The amount of time before the alarm is fully armed.&lt;br/&gt;&lt;b&gt;Default: 30&lt;/b&gt;
     * @param {int} alarmSensitivityDeviceCount The number of alarm devices which must trigger before the alarm is fired.&lt;br/&gt;&lt;b&gt;Default: 1&lt;/b&gt;
     * @param {boolean} silent Hub and keypad make sounds when arming.&lt;br/&gt;&lt;b&gt;Default: true&lt;/b&gt;
     * @param {boolean} soundsEnabled When true only notifications will be sent, alert devices will not be triggered.
     * @param {set<string>} activeDevices The addresses of the devices that are participating in this alarm.
     * @param {string} armedBy The person arming the security alarm or empty if being armed via keypad or a rule
     * @param {string} armedFrom The address of the keypad, rule, scene, or app the security alarm was armed from.
     * @return {Promise}
     */
    Arm(mode, bypassed, entranceDelaySecs, exitDelaySecs, alarmSensitivityDeviceCount, silent, soundsEnabled, activeDevices, armedBy, armedFrom) {
      return Bridge.request('hubalarm:Arm', this.GetDestination(), {
        mode,
        bypassed,
        entranceDelaySecs,
        exitDelaySecs,
        alarmSensitivityDeviceCount,
        silent,
        soundsEnabled,
        activeDevices,
        armedBy,
        armedFrom,
      });
    },
    /**
     * @function Disarm
     *
     * Attempts to disarm the security alarm.  This MAY also cancel any incidents in progress.
     *
     * @param {string} disarmedBy Address of the person that disarmed or cancelled the incident.
     * @param {string} disarmedFrom The address of the keypad, rule, scene, or app the security alarm was disarmed from.
     * @return {Promise}
     */
    Disarm(disarmedBy, disarmedFrom) {
      return Bridge.request('hubalarm:Disarm', this.GetDestination(), {
        disarmedBy,
        disarmedFrom,
      });
    },
    /**
     * @function Panic
     *
     * Triggers the PANIC alarm.
     *
     * @param {string} source Address of the trigger source
     * @param {enum} event Triggering Event
     * @return {Promise}
     */
    Panic(source, event) {
      return Bridge.request('hubalarm:Panic', this.GetDestination(), {
        source,
        event,
      });
    },
    /**
     * @function ClearIncident
     *
     * Issued by the platform when an incident has been fully canceled so the hub will clear out the current incident and related triggers.
     *
     * @return {Promise}
     */
    ClearIncident() {
      return Bridge.request('hubalarm:ClearIncident', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onVerified
     *
     * Issued by alarm subsystem to the hub if a user verifies an alarm.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onVerified(callback) {
      Cornea.on('hubalarm hubalarm:Verified', callback);
    },
    /**
     * @function onPrealertTriggered
     *
     * Issued by the platform alarm provider when the alarm subsystem has gone into a prealert state, typically from a security alarm.  In other. words when subalarm:alarmState transitions to PREALERT.   The expectation here is that the hub would play whatever sounds and update the LEDs as necessary for the grace period.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPrealertTriggered(callback) {
      Cornea.on('hubalarm hubalarm:PrealertTriggered', callback);
    },
    /**
     * @function onAlertTriggered
     *
     * Issued by the platform alarm provider when an alert has been detected.  In other words, when alarm:alertState:&lt;alertName&gt; transitions to ALERT.   The expectation here is that the hub would play whatever sounds and update the LEDs as necessary for whatever alert has been triggered.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onAlertTriggered(callback) {
      Cornea.on('hubalarm hubalarm:AlertTriggered', callback);
    },
    /**
     * @function onAlertCancelled
     *
     * Issued by the platform alarm provider when an alert has been cancelled.  In other words, when alarm:alertState:&lt;alertName&gt; transitions to CLEARING.  The expectation here is that the hub would play whatever sounds and update the LEDs as necessary for whatever alert has been cancelled.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onAlertCancelled(callback) {
      Cornea.on('hubalarm hubalarm:AlertCancelled', callback);
    },
    /**
     * @function onSecurityArming
     *
     * Issued by the platform alarm provider when the alarm subsystem is being armed either via the app or a keypad.  In other words, when alarm:alertState:SECURITY transitions to ARMING.  The expectation here is that the hub would play whatever sounds and update the LEDs as necessary for the specified mode and the duration of the exit delay.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onSecurityArming(callback) {
      Cornea.on('hubalarm hubalarm:SecurityArming', callback);
    },
    /**
     * @function onSecurityArmed
     *
     * Issued by the platform alarm provider when the alarm subsystem completes arming.  In other words, when alarm:alertState:SECURITY transitions to READY.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onSecurityArmed(callback) {
      Cornea.on('hubalarm hubalarm:SecurityArmed', callback);
    },
    /**
     * @function onSecurityDisarmed
     *
     * Issued by the platform alarm provider when the alarm subsystem completes disarming.  In other words, when alarm:alertState:SECURITY transitions to DISARMED.  The expectation here is that the hub would play whatever sounds and update the LEDs as necessary when the security alarm is disarmed.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onSecurityDisarmed(callback) {
      Cornea.on('hubalarm hubalarm:SecurityDisarmed', callback);
    },
  },
  STATE_SUSPENDED: 'SUSPENDED',
  STATE_ACTIVE: 'ACTIVE',
  ALARMSTATE_INACTIVE: 'INACTIVE',
  ALARMSTATE_READY: 'READY',
  ALARMSTATE_PREALERT: 'PREALERT',
  ALARMSTATE_ALERTING: 'ALERTING',
  ALARMSTATE_CLEARING: 'CLEARING',
  SECURITYMODE_INACTIVE: 'INACTIVE',
  SECURITYMODE_DISARMED: 'DISARMED',
  SECURITYMODE_ON: 'ON',
  SECURITYMODE_PARTIAL: 'PARTIAL',
  SECURITYALERTSTATE_INACTIVE: 'INACTIVE',
  SECURITYALERTSTATE_PENDING_CLEAR: 'PENDING_CLEAR',
  SECURITYALERTSTATE_DISARMED: 'DISARMED',
  SECURITYALERTSTATE_ARMING: 'ARMING',
  SECURITYALERTSTATE_READY: 'READY',
  SECURITYALERTSTATE_PREALERT: 'PREALERT',
  SECURITYALERTSTATE_ALERT: 'ALERT',
  SECURITYALERTSTATE_CLEARING: 'CLEARING',
  PANICALERTSTATE_INACTIVE: 'INACTIVE',
  PANICALERTSTATE_PENDING_CLEAR: 'PENDING_CLEAR',
  PANICALERTSTATE_DISARMED: 'DISARMED',
  PANICALERTSTATE_ARMING: 'ARMING',
  PANICALERTSTATE_READY: 'READY',
  PANICALERTSTATE_PREALERT: 'PREALERT',
  PANICALERTSTATE_ALERT: 'ALERT',
  PANICALERTSTATE_CLEARING: 'CLEARING',
  SMOKEALERTSTATE_INACTIVE: 'INACTIVE',
  SMOKEALERTSTATE_PENDING_CLEAR: 'PENDING_CLEAR',
  SMOKEALERTSTATE_DISARMED: 'DISARMED',
  SMOKEALERTSTATE_ARMING: 'ARMING',
  SMOKEALERTSTATE_READY: 'READY',
  SMOKEALERTSTATE_PREALERT: 'PREALERT',
  SMOKEALERTSTATE_ALERT: 'ALERT',
  SMOKEALERTSTATE_CLEARING: 'CLEARING',
  COALERTSTATE_INACTIVE: 'INACTIVE',
  COALERTSTATE_PENDING_CLEAR: 'PENDING_CLEAR',
  COALERTSTATE_DISARMED: 'DISARMED',
  COALERTSTATE_ARMING: 'ARMING',
  COALERTSTATE_READY: 'READY',
  COALERTSTATE_PREALERT: 'PREALERT',
  COALERTSTATE_ALERT: 'ALERT',
  COALERTSTATE_CLEARING: 'CLEARING',
  WATERALERTSTATE_INACTIVE: 'INACTIVE',
  WATERALERTSTATE_PENDING_CLEAR: 'PENDING_CLEAR',
  WATERALERTSTATE_DISARMED: 'DISARMED',
  WATERALERTSTATE_ARMING: 'ARMING',
  WATERALERTSTATE_READY: 'READY',
  WATERALERTSTATE_PREALERT: 'PREALERT',
  WATERALERTSTATE_ALERT: 'ALERT',
  WATERALERTSTATE_CLEARING: 'CLEARING',
};
