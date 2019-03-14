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
 * @module {Object} i2web/models/SecurityAlarmMode SecurityAlarmMode
 * @parent app.models.capabilities
 *
 * Security alarm subsystem mode.
 */
export default {
  writeableAttributes: [
    /**
     * @property {set<String>} subsecuritymode\:devices
     *
     * The addresses of all the security devices that participate in this mode.
     *
     */
    'subsecuritymode:devices',
    /**
     * @property {int} subsecuritymode\:entranceDelaySec
     *
     * The amount of time an alarm device must be triggering for before the alarm is fired.&lt;br/&gt;&lt;b&gt;Default: 30&lt;/b&gt;
     *
     */
    'subsecuritymode:entranceDelaySec',
    /**
     * @property {int} subsecuritymode\:exitDelaySec
     *
     * The amount of time before the alarm is fully armed.&lt;br/&gt;&lt;b&gt;Default: 30&lt;/b&gt;
     *
     */
    'subsecuritymode:exitDelaySec',
    /**
     * @property {int} subsecuritymode\:alarmSensitivityDeviceCount
     *
     * The number of alarm devices which must trigger before the alarm is fired.&lt;br/&gt;&lt;b&gt;Default: 1&lt;/b&gt;
     *
     */
    'subsecuritymode:alarmSensitivityDeviceCount',
    /**
     * @property {boolean} subsecuritymode\:silent
     *
     * When true only notifications will be sent, alert devices will not be triggered.
     *
     */
    'subsecuritymode:silent',
    /**
     * @property {boolean} subsecuritymode\:soundsEnabled
     *
     * Hub and keypad make sounds when arming.&lt;br/&gt;&lt;b&gt;Default: true&lt;/b&gt;
     *
     */
    'subsecuritymode:soundsEnabled',
    /**
     * @property {int} subsecuritymode\:motionSensorCount
     *
     * The number of the number of motion sensors associated with this mode
     *
     */
    'subsecuritymode:motionSensorCount',
  ],
  methods: {},
  events: {},

};
