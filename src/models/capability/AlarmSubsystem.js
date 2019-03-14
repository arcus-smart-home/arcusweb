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

/**
 * @module {Object} i2web/models/AlarmSubsystem AlarmSubsystem
 * @parent app.models.capabilities
 *
 * Generic alarm subsystem.
 */
export default {
  writeableAttributes: [
    /**
     * @property {set<enum>} subalarm\:monitoredAlerts
     *
     * The set of alarms which are professionally monitored.
     *
     */
    'subalarm:monitoredAlerts',
    /**
     * @property {list<CallTreeEntry>} subalarm\:callTree
     *
     * The list of people who should be notified when the alarm goes into alert mode.  This is marked as a list to maintain ordering, but each entry may only appear once.
Note that all addresses must be persons associated with this place.
     *
     */
    'subalarm:callTree',
    /**
     * @property {boolean} subalarm\:testModeEnabled
     *
     * Flag used by AlarmIncidentService. When true the service implementation should create a mock incident instead. Defaults to false
     *
     */
    'subalarm:testModeEnabled',
    /**
     * @property {boolean} subalarm\:fanShutoffOnSmoke
     *
     * When set to true, all fans, thermostats and space heaters will be turned off when a Smoke alarm is triggered.  Defaults to false.
     *
     */
    'subalarm:fanShutoffOnSmoke',
    /**
     * @property {boolean} subalarm\:fanShutoffOnCO
     *
     * When set to true, all fans, thermostats and space heaters will be turned off when a CO alarm is triggered.  Defaults to true
     *
     */
    'subalarm:fanShutoffOnCO',
    /**
     * @property {boolean} subalarm\:recordOnSecurity
     *
     * When set to true all cameras will record.  This flag may be true even if recordingSupported is false.  Default to be true.
     *
     */
    'subalarm:recordOnSecurity',
    /**
     * @property {int} subalarm\:recordingDurationSec
     *
     * The number of seconds to record for when a security alarm is triggered.  Default to be 60 seconds.
     *
     */
    'subalarm:recordingDurationSec',
  ],
  methods: {
    /**
     * @function ListIncidents
     *
     * Immediately puts the alarm into ALERT mode and record the lastAlertCause as PANIC.  If it is in ALERT this will have no affect.  If it is in any other state this will return an error.The cause will be recorded as the lastAlertCause.
     *
     * @return {Promise}
     */
    ListIncidents() {
      return Bridge.request('subalarm:ListIncidents', this.GetDestination(), {});
    },
    /**
     * @function Arm
     *
     * Attempts to arm the alarm into the requested mode, if successful it will return the delay until the alarm is armed.  If this call is repeated with the alarm is in the process of arming with the same mode, it will return the remaining seconds until the alarm is armed (making retries safe).  If this call is invoked with a new mode while the alarm is arming an error will be returned.  If this call is invoked while the alarm is arming with bypassed devices it will return an error.
     *
     * @param {string} mode
     * @return {Promise}
     */
    Arm(mode) {
      return Bridge.request('subalarm:Arm', this.GetDestination(), {
        mode,
      });
    },
    /**
     * @function ArmBypassed
     *
     * Attempts to arm the alarm into the requested mode, excluding any offline or currently tripped devices.  If successful it will return the delay until the alarm is armed.  If this call is repeated with the alarm is in the process of arming with the same mode, it will return the remaining seconds until the alarm is armed (making retries safe).  If this call is invoked with a new mode while the alarm is arming an error will be returned.  If this call is invoked while the alarm is arming with bypassed devices it will return an error.
     *
     * @param {string} mode
     * @return {Promise}
     */
    ArmBypassed(mode) {
      return Bridge.request('subalarm:ArmBypassed', this.GetDestination(), {
        mode,
      });
    },
    /**
     * @function Disarm
     *
     * Attempts to disarm the security alarm.  This MAY also cancel any incidents in progress.
     *
     * @return {Promise}
     */
    Disarm() {
      return Bridge.request('subalarm:Disarm', this.GetDestination(), {});
    },
    /**
     * @function Panic
     *
     * Triggers the PANIC alarm.
     *
     * @return {Promise}
     */
    Panic() {
      return Bridge.request('subalarm:Panic', this.GetDestination(), {});
    },
    /**
     * @function SetProvider
     *
     * .
     *
     * @param {enum} provider
     * @return {Promise}
     */
    SetProvider(provider) {
      return Bridge.request('subalarm:SetProvider', this.GetDestination(), {
        provider,
      });
    },
  },
  events: {},
  ALARMSTATE_INACTIVE: 'INACTIVE',
  ALARMSTATE_READY: 'READY',
  ALARMSTATE_PREALERT: 'PREALERT',
  ALARMSTATE_ALERTING: 'ALERTING',
  ALARMSTATE_CLEARING: 'CLEARING',
  SECURITYMODE_INACTIVE: 'INACTIVE',
  SECURITYMODE_DISARMED: 'DISARMED',
  SECURITYMODE_ON: 'ON',
  SECURITYMODE_PARTIAL: 'PARTIAL',
  ALARMPROVIDER_PLATFORM: 'PLATFORM',
  ALARMPROVIDER_HUB: 'HUB',
  REQUESTEDALARMPROVIDER_PLATFORM: 'PLATFORM',
  REQUESTEDALARMPROVIDER_HUB: 'HUB',
};
