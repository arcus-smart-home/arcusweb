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
 * @module {Object} i2web/models/SecuritySubsystem SecuritySubsystem
 * @parent app.models.capabilities
 *
 * Security alarm subsystem.
 */
export default {
  writeableAttributes: [
    /**
     * @property {list<CallTreeEntry>} subsecurity\:callTree
     *
     * The list of people who should be notified when the alarm goes into alert mode.  This is marked as a list to maintain ordering, but each entry may only appear once.
Note that all addresses must be persons associated with this place.
     *
     */
    'subsecurity:callTree',
    /**
     * @property {int} subsecurity\:keypadArmBypassedTimeOutSec
     *
     * The number of seconds the subsystem will allow for a second keypad ON push to armbypassed the system.
     *
     */
    'subsecurity:keypadArmBypassedTimeOutSec',
  ],
  methods: {
    /**
     * @function Panic
     *
     * Immediately puts the alarm into ALERT mode and record the lastAlertCause as PANIC.  If it is in ALERT this will have no affect.  If it is in any other state this will return an error.The cause will be recorded as the lastAlertCause.
     *
     * @param {boolean} silent
     * @return {Promise}
     */
    Panic(silent) {
      return Bridge.request('subsecurity:Panic', this.GetDestination(), {
        silent,
      });
    },
    /**
     * @function Arm
     *
     * Attempts to arm the alarm into the requested mode, if successful it will return the delay until the alarm is armed.  If this call is repeated with the alarm is in the process of arming with the same mode, it will return the remaining seconds until the alarm is armed (making retries safe).  If this call is invoked with a new mode while the alarm is arming an error will be returned.  If this call is invoked while the alarm is arming with bypassed devices it will return an error.
If the alarm is in any state other than &#x27;DISARMED&#x27; this will return an error.
If any devices associated with the alarm mode are triggered, this will return an error with code &#x27;TriggeredDevices&#x27;.
     *
     * @param {string} mode
     * @return {Promise}
     */
    Arm(mode) {
      return Bridge.request('subsecurity:Arm', this.GetDestination(), {
        mode,
      });
    },
    /**
     * @function ArmBypassed
     *
     * Attempts to arm the alarm into the request mode, bypassing any triggered devices.  If successful it will return the delay until the alarm is armed.  If this call is repeated with the alarm is in the process of arming with the same mode, it will return the remaining seconds until the alarm is armed (making retries safe).  If this call is invoked with a new mode while the alarm is arming an error will be returned.
If the alarm is in any state other than &#x27;DISARMED&#x27; this will return an error.
If all devices in the requested mode are faulted, this will return an error.
     *
     * @param {string} mode
     * @return {Promise}
     */
    ArmBypassed(mode) {
      return Bridge.request('subsecurity:ArmBypassed', this.GetDestination(), {
        mode,
      });
    },
    /**
     * @function Acknowledge
     *
     * This call acknowledges the alarm and indicates the given user is taking responsibility for dealing with it.  This will stop call tree processing but not stop the alerts.
     *
     * @return {Promise}
     */
    Acknowledge() {
      return Bridge.request('subsecurity:Acknowledge', this.GetDestination(), {});
    },
    /**
     * @function Disarm
     *
     * Requests that the alarm be returned to the disarmed state.  If the alarm is currently in Alert then this will acknowledge the alarm (if it was not previously acknowledged) and transition to CLEARING.
     *
     * @return {Promise}
     */
    Disarm() {
      return Bridge.request('subsecurity:Disarm', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onArmed
     *
     * Fired when the alarmState from ARMING to ARMED.  This event is not re-sent when the system goes from SOAKING to ARMED.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onArmed(callback) {
      Cornea.on('subsecurity subsecurity:Armed', callback);
    },
    /**
     * @function onAlert
     *
     * Fired when alarmState switches from ARMED to ALERTING.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onAlert(callback) {
      Cornea.on('subsecurity subsecurity:Alert', callback);
    },
    /**
     * @function onDisarmed
     *
     * Fired when alarmState switches to DISARMED.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDisarmed(callback) {
      Cornea.on('subsecurity subsecurity:Disarmed', callback);
    },
  },
  ALARMSTATE_DISARMED: 'DISARMED',
  ALARMSTATE_ARMING: 'ARMING',
  ALARMSTATE_ARMED: 'ARMED',
  ALARMSTATE_ALERT: 'ALERT',
  ALARMSTATE_CLEARING: 'CLEARING',
  ALARMSTATE_SOAKING: 'SOAKING',
  ALARMMODE_OFF: 'OFF',
  ALARMMODE_ON: 'ON',
  ALARMMODE_PARTIAL: 'PARTIAL',
  CURRENTALERTCAUSE_ALARM: 'ALARM',
  CURRENTALERTCAUSE_PANIC: 'PANIC',
  CURRENTALERTCAUSE_NONE: 'NONE',
  LASTACKNOWLEDGEMENT_NEVER: 'NEVER',
  LASTACKNOWLEDGEMENT_PENDING: 'PENDING',
  LASTACKNOWLEDGEMENT_ACKNOWLEDGED: 'ACKNOWLEDGED',
  LASTACKNOWLEDGEMENT_FAILED: 'FAILED',
};
