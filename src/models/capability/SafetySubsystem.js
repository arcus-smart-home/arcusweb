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
 * @module {Object} i2web/models/SafetySubsystem SafetySubsystem
 * @parent app.models.capabilities
 *
 * Safety alarm subsystem.
 */
export default {
  writeableAttributes: [
    /**
     * @property {set<String>} subsafety\:ignoredDevices
     *
     * The addresses of the devices which should not be used to trigger safety alarms.
     *
     */
    'subsafety:ignoredDevices',
    /**
     * @property {list<CallTreeEntry>} subsafety\:callTree
     *
     * The list of people who should be notified when the alarm goes into alert mode.  This is marked as a list to maintain ordering, but each entry may only appear once.
Note that all addresses must be persons associated with this place.
     *
     */
    'subsafety:callTree',
    /**
     * @property {int} subsafety\:alarmSensitivityDeviceCount
     *
     * The number of alarm devices which must trigger before the alarm is fired.&lt;br/&gt;&lt;b&gt;Default: 1&lt;/b&gt;
     *
     */
    'subsafety:alarmSensitivityDeviceCount',
    /**
     * @property {int} subsafety\:quietPeriodSec
     *
     * The number of seconds after an alarm has been cleared before it can be fired again.&lt;br/&gt;&lt;b&gt;Default: 0&lt;/b&gt;
     *
     */
    'subsafety:quietPeriodSec',
    /**
     * @property {boolean} subsafety\:silentAlarm
     *
     * When set to true &#x27;alert&#x27; devices will not be triggered when the alarm is raised.
     *
     */
    'subsafety:silentAlarm',
    /**
     * @property {boolean} subsafety\:waterShutOff
     *
     * When set to true &#x27;valve&#x27; devices will be turned off when a water leak is detected.
     *
     */
    'subsafety:waterShutOff',
  ],
  methods: {
    /**
     * @function Trigger
     *
     * Immediately puts the alarm into ALERT mode IF it is in READY.  The cause will be recorded as the lastAlertCause.
     *
     * @param {string} cause
     * @return {Promise}
     */
    Trigger(cause) {
      return Bridge.request('subsafety:Trigger', this.GetDestination(), {
        cause,
      });
    },
    /**
     * @function Clear
     *
     * Immediately clear and cancel the active alarm.
     *
     * @return {Promise}
     */
    Clear() {
      return Bridge.request('subsafety:Clear', this.GetDestination(), {});
    },
  },
  events: {},
  ALARM_READY: 'READY',
  ALARM_WARN: 'WARN',
  ALARM_SOAKING: 'SOAKING',
  ALARM_ALERT: 'ALERT',
  ALARM_CLEARING: 'CLEARING',
  SMOKEPREALERT_READY: 'READY',
  SMOKEPREALERT_ALERT: 'ALERT',
};
