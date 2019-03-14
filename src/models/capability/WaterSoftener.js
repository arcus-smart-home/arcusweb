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
 * @module {Object} i2web/models/WaterSoftener WaterSoftener
 * @parent app.models.capabilities
 *
 * Model of a water softener.
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} watersoftener\:rechargeStartTime
     *
     * When regeneration is needed, hour of the day when it should be scheduled (e.g. 14 &#x3D; 2:00 PM). Does not guarantee that regeneration will occur daily.
     *
     */
    'watersoftener:rechargeStartTime',
  ],
  methods: {
    /**
     * @function rechargeNow
     *
     * Forces a recharge on the water softener.
     *
     * @return {Promise}
     */
    rechargeNow() {
      return Bridge.request('watersoftener:rechargeNow', this.GetDestination(), {});
    },
  },
  events: {},
  RECHARGESTATUS_READY: 'READY',
  RECHARGESTATUS_RECHARGING: 'RECHARGING',
  RECHARGESTATUS_RECHARGE_SCHEDULED: 'RECHARGE_SCHEDULED',
};
