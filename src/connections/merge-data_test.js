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

import canMap from 'can-map';
import canList from 'can-list';
import 'can-map-define';

import connect from 'can-connect/can-connect';
import canMapBehavior from 'can-connect/can/map/';
import constructor from 'can-connect/constructor/';
import constructorStore from 'can-connect/constructor/store/';
import realTime from 'can-connect/real-time/';
import mergeData from './merge-data';

// This disables can-connect's internal sorting and give full control over the order of mixins to the user.
// Consider removing this when https://github.com/canjs/can-connect/issues/130 is fixed.
connect.order = [];

const mockData = {
  id: 1,
  name: 'Darth Vader',
  skills: ['force choke', 'deep voice', 'robot legs'],
};
const MockMap = canMap.extend({
  removeAttr: true,
}, {});
const dataBehavior = function dataBehavior() {
  return {
    getData: function getData() {
      return Promise.resolve(mockData);
    },
    updateData: function updateData() {
      return Promise.resolve();
    },
  };
};
const connection = connect([dataBehavior, constructor, constructorStore, canMapBehavior, realTime, mergeData], {
  Map: MockMap,
  List: canList,
});
let map;

describe('i2web/connections/merge-data', () => {
  beforeEach(function beforeEach() {
    map = new MockMap(mockData);
    connection.addInstanceReference(map);
  });
  afterEach(function afterEach() {
    connection.deleteInstanceReference(map);
  });

  it('patch update does not remove missing properties', (done) => {
    connection.updateInstance({
      id: 1,
      skills: ['huh'],
    }).then((newInstance) => {
      assert.equal(newInstance.attr('name'), 'Darth Vader');
      done();
    }).catch(() => {
      console.error(arguments);
      assert.ok(false);
      done();
    });
  });

  describe('when removeAttr is true', () => {
    describe('retrieving an instance', function retrievingAnInstance() {
      it('does not remove missing properties', function doesNotRemove(done) {
        map.attr('anotherProperty', true);
        MockMap.get({ id: 1 }).then((instance) => {
          assert.equal(instance.attr('anotherProperty'), true);
          done();
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
          done();
        });
      });
    });
    describe('updating an instance', function updatingAnInstance() {
      it('merges arrays', (done) => {
        connection.updateInstance({
          id: 1,
          skills: ['huh'],
        }).then((newInstance) => {
          const serialized = newInstance.serialize();
          assert.deepEqual(serialized.skills, ['huh']);
          done();
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
          done();
        });
      });
      it('replaces populated arrays with empty ones', (done) => {
        connection.updateInstance({
          id: 1,
          skills: [],
        }).then((newInstance) => {
          const serialized = newInstance.serialize();
          assert.deepEqual(serialized.skills, []);
          done();
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
          done();
        });
      });
    });
  });
});
