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

import 'mocha/mocha';
import assert from 'chai';
import sinon from 'sinon';

import canMap from 'can-map';
import canList from 'can-list';
import stringUtils from 'can-util/js/string/';

import connect from 'can-connect/can-connect';
import canMapBehavior from 'can-connect/can/map/';
import constructor from 'can-connect/constructor/';
import constructorStore from 'can-connect/constructor/store/';
import canMapAddress from './can-map-address';

// This disables can-connect's internal sorting and give full control over the order of mixins to the user.
// Consider removing this when https://github.com/canjs/can-connect/issues/130 is fixed.
connect.order = [];

const MockMap = canMap.extend({
  metadata: {
    namespace: 'these:droids:{base:id}',
  },
  GetDestination(params) {
    return stringUtils.sub(this.metadata.namespace, params);
  },
}, {});

const dataBehavior = function dataBehavior() {
  return {
    getData: function updateData() {
      return new Promise((resolve) => {
        resolve({
          'base:id': 1,
          'base:address': 'these:droids:1',
          name: 'CP30',
        });
      });
    },
  };
};
const connection = connect([dataBehavior, constructor, constructorStore, canMapAddress, canMapBehavior], {
  idProp: 'base:id',
  Map: MockMap,
  List: canList,
});

describe('i2web/connections/can-map-address', () => {
  beforeEach(function beforeEach() {
    this.sinon = sinon.sandbox.create();
    this.sinon.spy(connection, 'getData');
  });

  afterEach(function afterEach() {
    this.sinon.reset();
  });
  describe('Making a `get` request with a base:id', () => {
    it('Adds a base:address property', (done) => {
      MockMap.get({
        'base:id': 1,
      }).then(() => {
        assert.deepEqual(connection.getData.args[0][0], { 'base:id': 1, 'base:address': 'these:droids:1' });
        done();
      }).catch(() => {
        console.error(arguments);
        assert.ok(false);
        done();
      });
    });
  });
});
