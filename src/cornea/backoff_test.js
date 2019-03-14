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
import llx from 'lolex';
import sinon from 'sinon';

import Backoff from './backoff';

let backoff;
let callback;

describe('i2web/cornea/backoff', function backoffTests() {
  beforeEach(function beforeEach() {
    this.sinon = sinon.sandbox.create();
    callback = this.sinon.spy();
    backoff = new Backoff({
      initial: 1,
      max: 10,
      callback,
    });
    this.clock = llx.install();
  });

  afterEach(function afterEach() {
    this.sinon.restore();
    this.clock.uninstall();
  });

  describe('start', function start() {
    it('invokes callback after initial delay', function initialInvoke() {
      backoff.start();
      this.clock.tick(1);
      assert.equal(callback.callCount, 1);
    });
  });

  describe('continue', function continueFn() {
    beforeEach(function beforeEach() {
      backoff.start();
      this.clock.tick(1);
      backoff.continue();
    });
    it.skip('invokes callback after doubled delay', function doubleDelay() {
      this.clock.tick(1);
      assert.equal(callback.callCount, 1);
      this.clock.tick(1);
      assert.equal(callback.callCount, 2);
    });
    it.skip('delay doubles each time', function doubleEachTime() {
      this.clock.tick(1);
      assert.equal(callback.callCount, 1);
      this.clock.tick(1);
      assert.equal(callback.callCount, 2);
      backoff.continue();
      this.clock.tick(4);
      assert.equal(callback.callCount, 3);
      backoff.continue();
      this.clock.tick(8);
      assert.equal(callback.callCount, 4);
    });
    it.skip('delay never exceed max', function neverMax() {
      this.clock.tick(2);
      assert.equal(callback.callCount, 2);
      backoff.continue();
      this.clock.tick(4);
      assert.equal(callback.callCount, 3);
      backoff.continue();
      this.clock.tick(8);
      assert.equal(callback.callCount, 4);
      backoff.continue();
      this.clock.tick(10);
      assert.equal(callback.callCount, 5);
      backoff.continue();
      this.clock.tick(10);
      assert.equal(callback.callCount, 6);
      backoff.continue();
      this.clock.tick(10);
      assert.equal(callback.callCount, 7);
    });
  });

  describe('reset', function reset() {
    it('stops current iteration', function stopsIteration() {
      backoff.start();
      backoff.reset();
      this.clock.tick(1);
      assert.equal(callback.callCount, 0);
    });
  });

  describe('cancel', function start() {
    it('stops current iteration', function stopsIteration() {
      backoff.start();
      backoff.cancel();
      this.clock.tick(1);
      assert.equal(callback.callCount, 0);
    });
    it('prevents continue from workin', function preventsContinue() {
      backoff.start();
      backoff.cancel();
      this.clock.tick(1);
      assert.equal(callback.callCount, 0);
      backoff.continue();
      this.clock.tick(2);
      assert.equal(callback.callCount, 0);
    });
  });
});
