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
 * @module {Object} i2web/models/ProblemDevice ProblemDevice
 * @parent app.models.capabilities
 *
 * Model of a problem device description
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function AddProblemDevices
     *
     * Add device(s) having a problem to the db. Normally taken care of by the end session call.
     *
     * @param {list<ProblemDevice>} models list of devices
     * @return {Promise}
     */
    AddProblemDevices(models) {
      return Bridge.request('suppprobdev:AddProblemDevices', this.GetDestination(), {
        models,
      });
    },
    /**
     * @function ListProblemDevicesForTimeframe
     *
     * Lists problem devices within a time range across accounts and places
     *
     * @param {string} [deviceModel] specific device type to return problem devices for
     * @param {string} [mfg] manufacturer to return problem devices for
     * @param {string} [deviceType] generic device type to return problem devices for
     * @param {string} startDate Earliest date for problem devices. Format is yyyy-MM-dd HH:mm:ss
     * @param {string} endDate Latest date for problem devices. Format is yyyy-MM-dd HH:mm:ss
     * @param {string} [token] token for paging results
     * @param {int} [limit] max 1000, default 50
     * @return {Promise}
     */
    ListProblemDevicesForTimeframe(deviceModel, mfg, deviceType, startDate, endDate, token, limit) {
      return Bridge.request('suppprobdev:ListProblemDevicesForTimeframe', this.GetDestination(), {
        deviceModel,
        mfg,
        deviceType,
        startDate,
        endDate,
        token,
        limit,
      });
    },
  },
  events: {},

};
