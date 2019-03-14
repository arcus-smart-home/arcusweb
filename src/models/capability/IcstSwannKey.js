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
 * @module {Object} i2web/models/IcstSwannKey IcstSwannKey
 * @parent app.models.capabilities
 *
 * Model of an ICST Swann Lookup record. This is a read-only record. Records
are only added through an automated process that processes CSV files containing
the information.
Records cannot be deleted, since they tie back to actual devices.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function CreateLookupRecords
     *
     * Add records to the swann_record table.
     *
     * @param {string} data b64 set of records to add
     * @return {Promise}
     */
    CreateLookupRecords(data) {
      return Bridge.request('icstswannkey:CreateLookupRecords', this.GetDestination(), {
        data,
      });
    },
    /**
     * @function LookupBySn
     *
     * Lookup a Swann key record by serial number
     *
     * @param {string} sn serial number of the device
     * @return {Promise}
     */
    LookupBySn(sn) {
      return Bridge.request('icstswannkey:LookupBySn', this.GetDestination(), {
        sn,
      });
    },
    /**
     * @function LookupByMac
     *
     * Lookup a Swann key record by MAC address
     *
     * @param {string} mac MAC address of the device
     * @return {Promise}
     */
    LookupByMac(mac) {
      return Bridge.request('icstswannkey:LookupByMac', this.GetDestination(), {
        mac,
      });
    },
  },
  events: {},

};
