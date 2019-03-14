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
import overwrite from './overwrite';

// Spies can't quite keep track of the original prototype or static functions after they are overwritten
// so these global counters are incremented in each and that serves as a crude spy.
let prototypeBaseCount = 0;
let staticBaseCount = 0;

const mockBehavior = {
  save() {},
  get() {},
};

const prototypeOverwrites = {
  save(base, connection) {
    return function newSave() {
      connection.save();
      base();
    };
  },
};

const staticOverwrites = {
  get(base, connection) {
    return function newGet() {
      connection.get();
      base();
    };
  },
};

let mockConstructor;

describe('i2web/connections/helpers/overwrite', () => {
  beforeEach(function beforeEach() {
    prototypeBaseCount = 0;
    staticBaseCount = 0;
    this.sinon = sinon.sandbox.create();
    mockConstructor = function construct() {};
    mockConstructor.get = function get() { staticBaseCount++; };
    mockConstructor.prototype.save = function save() { prototypeBaseCount++; };
  });

  afterEach(function afterEach() {
    this.sinon = this.sinon.restore();
  });

  describe('when overwriting a prototype function', () => {
    beforeEach(function beforeEach() {
      this.sinon.spy(prototypeOverwrites, 'save');
      overwrite(mockBehavior, mockConstructor, prototypeOverwrites);
      this.sinon.spy(mockBehavior, 'save');
    });

    it('overwrite function is called once', () => {
      assert.equal(prototypeOverwrites.save.callCount, 1);
    });

    describe('the overwritten function', () => {
      beforeEach(function beforeEach() {
        mockConstructor.prototype.save();
      });

      it('can invoke base function', () => {
        assert.equal(prototypeBaseCount, 1);
      });

      it('can invoke a connection function', () => {
        assert.equal(mockBehavior.save.callCount, 1);
      });
    });
  });

  describe('when overwriting a static function', () => {
    beforeEach(function beforeEach() {
      this.sinon.spy(staticOverwrites, 'get');
      overwrite(mockBehavior, mockConstructor, {}, staticOverwrites);
      this.sinon.spy(mockBehavior, 'get');
    });

    it('overwrite function is called once', () => {
      assert.equal(staticOverwrites.get.callCount, 1);
    });

    describe('the overwritten function', () => {
      beforeEach(function beforeEach() {
        mockConstructor.get();
      });

      it('can invoke base function', () => {
        assert.equal(staticBaseCount, 1);
      });

      it('can invoke a connection function', () => {
        assert.equal(mockBehavior.get.callCount, 1);
      });
    });
  });
});
