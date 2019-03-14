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
 * @module {Object} i2web/models/Halo Halo
 * @parent app.models.capabilities
 *
 * Information to support Halo devices.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} halo\:room
     *
     * This is the room type description for the location of the Halo device, which can be read out in an alert.
     *
     */
    'halo:room',
    /**
     * @property {enum} halo\:haloalertstate
     *
     * State of the Arcus system, as transmited to Halo to be indicated to the user through lights and sound.
     *
     */
    'halo:haloalertstate',
  ],
  methods: {
    /**
     * @function StartHush
     *
     * Start a new hush process (assumes device is in pre-alert state).
     *
     * @return {Promise}
     */
    StartHush() {
      return Bridge.request('halo:StartHush', this.GetDestination(), {});
    },
    /**
     * @function SendHush
     *
     * Send when user says Halo is flashing a particular color.
     *
     * @param {enum} color Color the user says is being currently displayed by Halo in the Hush process.
     * @return {Promise}
     */
    SendHush(color) {
      return Bridge.request('halo:SendHush', this.GetDestination(), {
        color,
      });
    },
    /**
     * @function CancelHush
     *
     * Cancel out of current hush process.
     *
     * @return {Promise}
     */
    CancelHush() {
      return Bridge.request('halo:CancelHush', this.GetDestination(), {});
    },
    /**
     * @function StartTest
     *
     * Run test cycle on the Halo. Should be moved to some generic capability.
     *
     * @return {Promise}
     */
    StartTest() {
      return Bridge.request('halo:StartTest', this.GetDestination(), {});
    },
  },
  events: {},
  DEVICESTATE_SAFE: 'SAFE',
  DEVICESTATE_WEATHER: 'WEATHER',
  DEVICESTATE_SMOKE: 'SMOKE',
  DEVICESTATE_CO: 'CO',
  DEVICESTATE_PRE_SMOKE: 'PRE_SMOKE',
  DEVICESTATE_EOL: 'EOL',
  DEVICESTATE_LOW_BATTERY: 'LOW_BATTERY',
  DEVICESTATE_VERY_LOW_BATTERY: 'VERY_LOW_BATTERY',
  DEVICESTATE_FAILED_BATTERY: 'FAILED_BATTERY',
  HUSHSTATUS_SUCCESS: 'SUCCESS',
  HUSHSTATUS_TIMEOUT: 'TIMEOUT',
  HUSHSTATUS_READY: 'READY',
  HUSHSTATUS_DISABLED: 'DISABLED',
  ROOM_NONE: 'NONE',
  ROOM_BASEMENT: 'BASEMENT',
  ROOM_BEDROOM: 'BEDROOM',
  ROOM_DEN: 'DEN',
  ROOM_DINING_ROOM: 'DINING_ROOM',
  ROOM_DOWNSTAIRS: 'DOWNSTAIRS',
  ROOM_ENTRYWAY: 'ENTRYWAY',
  ROOM_FAMILY_ROOM: 'FAMILY_ROOM',
  ROOM_GAME_ROOM: 'GAME_ROOM',
  ROOM_GUEST_BEDROOM: 'GUEST_BEDROOM',
  ROOM_HALLWAY: 'HALLWAY',
  ROOM_KIDS_BEDROOM: 'KIDS_BEDROOM',
  ROOM_LIVING_ROOM: 'LIVING_ROOM',
  ROOM_MASTER_BEDROOM: 'MASTER_BEDROOM',
  ROOM_OFFICE: 'OFFICE',
  ROOM_STUDY: 'STUDY',
  ROOM_UPSTAIRS: 'UPSTAIRS',
  ROOM_WORKOUT_ROOM: 'WORKOUT_ROOM',
  REMOTETESTRESULT_SUCCESS: 'SUCCESS',
  REMOTETESTRESULT_FAIL_ION_SENSOR: 'FAIL_ION_SENSOR',
  REMOTETESTRESULT_FAIL_PHOTO_SENSOR: 'FAIL_PHOTO_SENSOR',
  REMOTETESTRESULT_FAIL_CO_SENSOR: 'FAIL_CO_SENSOR',
  REMOTETESTRESULT_FAIL_TEMP_SENSOR: 'FAIL_TEMP_SENSOR',
  REMOTETESTRESULT_FAIL_WEATHER_RADIO: 'FAIL_WEATHER_RADIO',
  REMOTETESTRESULT_FAIL_OTHER: 'FAIL_OTHER',
  HALOALERTSTATE_QUIET: 'QUIET',
  HALOALERTSTATE_INTRUDER: 'INTRUDER',
  HALOALERTSTATE_PANIC: 'PANIC',
  HALOALERTSTATE_WATER: 'WATER',
  HALOALERTSTATE_SMOKE: 'SMOKE',
  HALOALERTSTATE_CO: 'CO',
  HALOALERTSTATE_CARE: 'CARE',
  HALOALERTSTATE_ALERTING_GENERIC: 'ALERTING_GENERIC',
};
