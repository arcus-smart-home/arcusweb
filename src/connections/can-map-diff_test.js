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
import canMapDiff from './can-map-diff';

// This disables can-connect's internal sorting and give full control over the order of mixins to the user.
// Consider removing this when https://github.com/canjs/can-connect/issues/130 is fixed.
connect.order = [];

const MockMap = canMap.extend({
  define: {
    writeableAttributes: {
      value() {
        return ['name', 'nickname', 'stuff'];
      },
    },
  },
});
let saveFail = false;
const dataBehavior = function dataBehavior() {
  return {
    updateData: function updateData() {
      return new Promise((resolve, reject) => {
        if (saveFail) {
          reject();
        } else {
          resolve();
        }
      });
    },
  };
};
const connection = connect([dataBehavior, constructor, constructorStore, canMapBehavior, canMapDiff], {
  Map: MockMap,
  List: canList,
});
let map;

describe('i2web/connections/can-map-diff', () => {
  beforeEach(function beforeEach() {
    map = new MockMap({
      id: 1,
      name: 'Anakin Skywalker',
      nickname: 'Ani',
      side: 'light',
      stuff: [{
        name: 'lightsaber',
        color: 'blue',
      }],
    });
    connection.changeStore.entries = {};
  });

  describe('tracking changes', () => {
    it('changes to writeable attributes are tracked', () => {
      map.attr('name', 'Darth Vader');
      assert.deepEqual(connection.changeStore.entries[1], ['name']);
    });
    it('changes to non-writeable attributes are not tracked', () => {
      map.attr('side', 'dark');
      assert.deepEqual(connection.changeStore.entries[1], []);
    });
    it('changes to top-level attributes are tracked', () => {
      map.attr('stuff.color', 'red');
      assert.deepEqual(connection.changeStore.entries[1], ['stuff']);
    });
  });

  describe('saving', () => {
    beforeEach(function beforeEach() {
      map.attr('name', 'Darth Vader');
    });
    describe('after a successful save', () => {
      beforeEach(function beforeEach() {
        saveFail = false;
      });
      it('tracked changes are removed', (done) => {
        map.save().then(() => {
          assert.deepEqual(connection.changeStore.entries[1], []);
          done();
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
          done();
        });
      });
    });
    describe('after an unsuccessful save', () => {
      beforeEach(function beforeEach() {
        saveFail = true;
      });
      it('tracked changes are not removed', (done) => {
        map.save().catch(() => {
          assert.deepEqual(connection.changeStore.entries[1], ['name']);
          done();
        });
      });
    });
  });
});
