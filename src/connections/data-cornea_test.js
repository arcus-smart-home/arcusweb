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
import 'can-map-define';
import Bridge from 'i2web/cornea/bridge';

import connect from 'can-connect/can-connect';
import canMapBehavior from 'can-connect/can/map/';
import constructor from 'can-connect/constructor/';
import constructorStore from 'can-connect/constructor/store/';
import canMapAddress from './can-map-address';
import canMapDiff from './can-map-diff';
import dataCornea from './data-cornea';
import strictSave from './strict-save';

const mockData = {
  'base:id': 1,
  'base:address': 'death:star:1',
  name: 'Anakin Skywalker',
  nickname: 'Ani',
  side: 'light',
};
let oldBridgeRequest;

// This disables can-connect's internal sorting and give full control over the order of mixins to the user.
// Consider removing this when https://github.com/canjs/can-connect/issues/130 is fixed.
connect.order = [];

const MockMap = canMap.extend({
  metadata: {
    namespace: 'death:star:{base:id}',
  },
  GetDestination(props) {
    if (props['base:address'] && !props['base:id']) {
      props['base:id'] = props['base:address'].split(':')[2];
    }
    return stringUtils.sub(this.metadata.namespace, props);
  },
}, {
  define: {
    writeableAttributes: {
      value() {
        return ['name', 'nickname', 'side'];
      },
    },
  },
});

let connection;
let map;

describe('i2web/connections/data-cornea', () => {
  before(function before() {
    oldBridgeRequest = Bridge.request;
    Bridge.request = function request() {
      return Promise.resolve(mockData);
    };
    connection = connect([dataCornea, constructor, constructorStore, canMapAddress, canMapBehavior, canMapDiff, strictSave], {
      idProp: 'base:id',
      Map: MockMap,
      List: canList,
    });
  });

  beforeEach(function beforeEach() {
    this.sinon = sinon.sandbox.create();
    this.sinon.spy(Bridge, 'request');
    map = new MockMap(mockData);
    connection.addInstanceReference(map);
  });

  afterEach(function afterEach() {
    this.sinon = this.sinon.restore();
    connection.deleteInstanceReference(map);
  });

  after(function after() {
    Bridge.request = oldBridgeRequest;
  });

  describe('get', () => {
    describe('Using the base:address', () => {
      it('Calls bridge base:GetAttributes with proper destination', (done) => {
        MockMap.get({
          'base:address': 'death:star:1',
        }).then(() => {
          assert.equal(Bridge.request.callCount, 1);
          assert.equal(Bridge.request.args[0][0], 'base:GetAttributes');
          assert.equal(Bridge.request.args[0][1], 'death:star:1');
          done();
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
          done();
        });
      });
    });
    describe('Using the base:id', () => {
      it('Calls bridge base:GetAttributes with proper destination', (done) => {
        MockMap.get({
          'base:id': '1',
        }).then(() => {
          assert.equal(Bridge.request.callCount, 1);
          assert.equal(Bridge.request.args[0][0], 'base:GetAttributes');
          assert.equal(Bridge.request.args[0][1], 'death:star:1');
          done();
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
          done();
        });
      });
    });
  });
  describe('save', () => {
    it('Calls bridge base:SetAttributes with proper destination', (done) => {
      map.attr('side', 'dark');
      map.save({
        'base:address': 'death:star:1',
      }).then(() => {
        assert.equal(Bridge.request.callCount, 1);
        assert.equal(Bridge.request.args[0][0], 'base:SetAttributes');
        done();
      }).catch(() => {
        console.error(arguments);
        assert.ok(false);
        done();
      });
    });
    it('Calls bridge base:SetAttributes with only changed (writeable) attributes', (done) => {
      map.attr('side', 'dark');
      map.attr('age', 30);
      map.save({
        'base:address': 'death:star:1',
      }).then(() => {
        assert.equal(Bridge.request.callCount, 1);
        assert.deepEqual(Bridge.request.args[0][2], { side: 'dark' });
        done();
      }).catch(() => {
        console.error(arguments);
        assert.ok(false);
        done();
      });
    });
    it('doesn\'t make save request and resolves the promise if nothing has changed', () => {
      return map.save().then(() => {
        assert.equal(Bridge.request.callCount, 0, 'didn\'t make bridge request');
      }).catch(() => {
        assert.fail('rejection', 'resolved', 'save should resolve if there are no changes during save');
      });
    });
  });
  describe('strictSave', () => {
    it('doesn\'t make save request and rejects the promise if nothing has changed', () => {
      return map.strictSave()
        .then(() => {
          assert.fail('resolved', 'rejection', 'strictSave should not resolve if there are no changes');
        })
        .catch((e) => {
          assert.equal(Bridge.request.callCount, 0, 'didn\'t make bridge request');
          if (e === 'no changes to save') {
            assert.isOk(true, 'map was not saved and returned intended rejection code');
          } else {
            assert.fail(e, 'no changes to save', `expected a specific rejection, got: "${e}"`);
          }
        });
    });
  });
});
