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
import ChangeStore from './changeStore';

const mockBehavior = {
  id(instance) {
    return instance.attr('id');
  },
};

const normalInstance = {
  attr(prop) {
    return this[prop];
  },
  id: 123,
  name: 'Arcus',
};
const serializeInstance = {
  attr(prop) {
    return this[prop];
  },
  serialize() {
    return {
      id: 456,
      name: 'Arcus',
    };
  },
  id: 456,
  name: 'Arcus',
};
const writeableInstance = {
  attr(prop) {
    return this[prop];
  },
  id: 789,
  name: 'Arcus',
  writeableAttributes: ['name'],
};
writeableInstance.writeableAttributes.attr = () => {
  return ['name'];
};

let store;

describe('i2web/connections/helpers/changeStore', () => {
  beforeEach(() => {
    store = new ChangeStore(mockBehavior);
  });

  describe('add', () => {
    it('keeps entries list unique', () => {
      store.add(normalInstance, 'name');
      store.add(normalInstance, 'name');
      assert.deepEqual(store.entries[123], ['name']);
    });

    describe('when writeableAttributes is undefined', () => {
      it('adds any property', () => {
        store.add(normalInstance, 'name');
        assert.deepEqual(store.entries[123], ['name']);
      });

      describe('when serialize is defined', () => {
        it('adds a serialized property', () => {
          store.add(serializeInstance, 'name');
          assert.deepEqual(store.entries[456], ['name']);
        });
        it('does not add an unserialized property', () => {
          store.add(serializeInstance, 'age');
          assert.deepEqual(store.entries[456], []);
        });
      });
    });

    describe('when writeableAttributes is defined', () => {
      it('adds a writeable property', () => {
        store.add(writeableInstance, 'name');
        assert.deepEqual(store.entries[789], ['name']);
      });
      it('does not add a non-writeable property', () => {
        store.add(writeableInstance, 'age');
        assert.deepEqual(store.entries[789], []);
      });
    });
  });

  describe('get', () => {
    describe('when an instance has entries', () => {
      beforeEach(() => {
        store.add(normalInstance, 'name');
      });

      it('returns array of entries', () => {
        assert.deepEqual(store.get(normalInstance), ['name']);
      });
    });

    describe('when an instance has no entries', () => {
      it('returns blank array', () => {
        assert.deepEqual(store.get(normalInstance), []);
      });
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      store.add(normalInstance, 'name');
      store.add(normalInstance, 'age');
      store.add(serializeInstance, 'name');
      store.add(writeableInstance, 'name');
    });

    it('clears all entries for an instance', () => {
      store.clear(normalInstance);
      assert.deepEqual(store.entries[123], []);
    });

    it('leaves other instance entries', () => {
      store.clear(normalInstance);
      assert.deepEqual(store.entries[456], ['name']);
      assert.deepEqual(store.entries[789], ['name']);
    });
  });
});
