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
 * @module {Object} i2web/models/IrrigationController IrrigationController
 * @parent app.models.capabilities
 *
 * Model of an Irrigation Controller.
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} irrcont\:budget
     *
     * Default: 100. Setting this number from 10-90 (most devices only support 10% increments) reduces the water usage to that percentage. Setting this number from 110-200) increases water usage for dryer moments. Note: current Orbit devices support &#x27;stacking&#x27; meaning if the increased schedule results in a subsequent start time to be delayed, this start time becomes &#x27;stacked&#x27; and handled as soon as possible. If the UI supports showing the user what zone is running, supporting budget&gt;100 means the UI will need to compute this stacking. Alternative is to not allow this number to be over 100 (as Arcus1 does).
     *
     */
    'irrcont:budget',
    /**
     * @property {int} irrcont\:rainDelay
     *
     * This attribute was deprecated in 1.8.
     *
     */
    'irrcont:rainDelay',
  ],
  methods: {
    /**
     * @function WaterNowV2
     *
     * Starts watering the indicated zone for the duration specified.
     *
     * @param {string} zone The zone number to begin watering.
     * @param {int} duration How long, in minutes, to water the zone.
     * @return {Promise}
     */
    WaterNowV2(zone, duration) {
      return Bridge.request('irrcont:WaterNowV2', this.GetDestination(), {
        zone,
        duration,
      });
    },
    /**
     * @function CancelV2
     *
     * Cancels any watering currently in progress.
     *
     * @param {string} zone The zone number to begin watering.
     * @return {Promise}
     */
    CancelV2(zone) {
      return Bridge.request('irrcont:CancelV2', this.GetDestination(), {
        zone,
      });
    },
    /**
     * @function WaterNow
     *
     * This method was deprecated in 1.8.
     *
     * @param {int} [zonenum] This parameter was deprecated in 1.8.
     * @param {int} duration How long, in minutes, to water the zone.
     * @return {Promise}
     */
    WaterNow(zonenum, duration) {
      return Bridge.request('irrcont:WaterNow', this.GetDestination(), {
        zonenum,
        duration,
      });
    },
    /**
     * @function Cancel
     *
     * This method was deprecated in 1.8.
     *
     * @param {int} [zonenum] This parameter was deprecated in 1.8.
     * @return {Promise}
     */
    Cancel(zonenum) {
      return Bridge.request('irrcont:Cancel', this.GetDestination(), {
        zonenum,
      });
    },
  },
  events: {},
  CONTROLLERSTATE_OFF: 'OFF',
  CONTROLLERSTATE_WATERING: 'WATERING',
  CONTROLLERSTATE_NOT_WATERING: 'NOT_WATERING',
  CONTROLLERSTATE_RAIN_DELAY: 'RAIN_DELAY',
};
