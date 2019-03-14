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
 * @module {Object} i2web/models/AlarmService AlarmService
 * @parent app.models.services
 *
 * Alarm Service
 */
export default {
  /**
   * @function AddAlarm
   *
   * Issued by the alarm subsystem when a new alert is added to an incident.
   *
   * @param {string} alarm The newly added alarm
   * @param {list<string>} alarms The list of alarms in the current state
   * @param {list<IncidentTrigger>} triggers The triggers associated with the newly added alarm.
   * @return {Promise}
   */
  AddAlarm(alarm, alarms, triggers) {
    return Bridge.request('alarmservice:AddAlarm', 'SERV:alarmservice:', {
      alarm,
      alarms,
      triggers,
    });
  },
  /**
   * @function CancelAlert
   *
   * Issued by the alarm subsystem when the alarm has been cleared
   *
   * @param {enum} method How the user (actor header) cancelled the alarm(s)
   * @param {List<string>} alarms The list of alarms that have been cancelled
   * @return {Promise}
   */
  CancelAlert(method, alarms) {
    return Bridge.request('alarmservice:CancelAlert', 'SERV:alarmservice:', {
      method,
      alarms,
    });
  },
};
