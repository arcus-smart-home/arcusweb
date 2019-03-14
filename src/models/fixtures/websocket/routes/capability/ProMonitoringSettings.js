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

import _ from 'lodash';
import routerUtils from '../../util';
import placeData from 'i2web/models/fixtures/data/place/place.json';
import sensorData from 'i2web/models/fixtures/data/device/contact_sensors.json';
import glassBreakData from 'i2web/models/fixtures/data/device/glass_break_sensors.json';

export default {
  'promon:CheckAvailability': function proMonitoringCheckAvailability() {
    return {
      // messageType: 'Error',
      // attributes: {
      //   code: 'invalidAddressError',
      //   message: 'invalidAddressError',
      // },

      messageType: 'promon:CheckAvailabilityResponse',
      attributes: {
        available: 'TRIAL',
      },
    };
  },
  'promon:JoinTrial': function proMonitoringJoinTrial(params) {
    const isValidCode = params.code === 'promon';
    if (!isValidCode) {
      return routerUtils.nullPointerResponse();
    }
    return {
      messageType: 'promon:JoinTrialResponse',
      attributes: {
        'promon:trial': true,
      },
    };
  },
  'promon:ValidateAddress': function proMonitoringValidateAddress() {
    const places = _.cloneDeep(placeData);
    const addressDetails = places[0];
    return {
      messageType: 'promon:ValidateAddressResponse',
      attributes: {
        valid: true,
        suggestions: [
          {
            line1: addressDetails['place:streetAddress1'],
            line2: addressDetails['place:streetAddress2'],
            city: addressDetails['place:city'],
            state: addressDetails['place:state'],
            zip: `${addressDetails['place:zipCode']}-1234`,
          },
          {
            line1: addressDetails['place:streetAddress1'],
            line2: `${addressDetails['place:streetAddress2']}Route 123`,
            city: addressDetails['place:city'],
            state: addressDetails['place:state'],
            zip: `${addressDetails['place:zipCode']}-5678`,
          },
        ],
      },
    };
  },
  'promon:UpdateAddress': function proMonitoringUpdateAddress() {
    // return {
    //  messageType: 'Error',
    //  attributes: {
    //    code: 'address.unsupported',
    //    message: `Nope`,
    //  },
    // };
    return {
      messageType: 'promon:UpdateAddressResponse',
      attributes: {},
    };
  },
  'promon:ListDepartments': function proMonitoringListDepartments() {
    return {
      messageType: 'promon:ListDepartmentsResponse',
      attributes: {
        departments: [
          {
            name: 'Lake County Sheriff',
            phone: '847-377-4000',
            line1: '25 S Martin Luther King Jr Ave',
            line2: '',
            city: 'Waukegan',
            state: 'IL',
            zip: '60085',
          },
          {
            name: 'Libertyville Police Department',
            phone: '847-362-8310',
            line1: '200 E Cook Ave',
            line2: 'Suite 2',
            city: 'Libertyville',
            state: 'IL',
            zip: '60048',
          },
        ],
      },
    };
  },
  'promon:CheckSensors': function proMonitoringCheckSensors() {
    const sensors = _.cloneDeep(sensorData);
    const glassBreak = _.cloneDeep(glassBreakData);
    const sensorArray = [];
    sensorArray.push(sensors[0]['base:address']);
    sensorArray.push(sensors[1]['base:address']);
    sensorArray.push(glassBreak[0]['base:address']);
    return {
      messageType: 'promon:CheckSensorsResponse',
      attributes: {
        offline: sensorArray,
      },
    };
  },
  'promon:Activate': function proMonitoringActivate() {
    const now = new Date();
    return {
      messageType: 'promon:ActivateResponse',
      attributes: {
        testCallStatus: 'SUCCESS',
        testCallTime: now.valueOf(),
      },
    };
  },
  'promon:TestCall': function proMonitoringTestCall() {
    const now = new Date();
    return {
      messageType: 'promon:TestCallResponse',
      attributes: {
        testCallStatus: 'WAITING',
        testCallTime: now.valueOf(),
      },
    };
  },
};
