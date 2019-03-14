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
 * @module {Object} i2web/models/Alarm Alarm
 * @parent app.models.capabilities
 *
 * An alarm.
 */
export default {
  writeableAttributes: [
    /**
     * @property {boolean} alarm\:silent
     *
     * When true only notifications will be sent, alert devices / keypads will not sound.
     *
     */
    'alarm:silent',
  ],
  methods: {},
  events: {},
  ALERTSTATE_INACTIVE: 'INACTIVE',
  ALERTSTATE_DISARMED: 'DISARMED',
  ALERTSTATE_ARMING: 'ARMING',
  ALERTSTATE_READY: 'READY',
  ALERTSTATE_PREALERT: 'PREALERT',
  ALERTSTATE_ALERT: 'ALERT',
  ALERTSTATE_CLEARING: 'CLEARING',
};
