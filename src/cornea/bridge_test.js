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
import fixture from 'can-fixture';
import developmentConfig from 'config/development.json';

import Cornea from './cornea';
import Bridge from './bridge';

fixture.on = true;
fixture.delay = 0;

let requestFail = false;
let oldCorneaSend;

fixture(`POST ${developmentConfig.apiUrl}/test/fn`, (request, response) => {
  if (requestFail) {
    response(500, request.data);
  } else {
    response(200, request.data);
  }
});

describe('i2web/cornea/bridge', function bridgeTests() {
  before(function before() {
    oldCorneaSend = Cornea.send;
    Cornea.send = function send() {
      return new Promise((resolve, reject) => {
        if (requestFail) {
          reject();
        } else {
          resolve();
        }
      });
    };
  });

  beforeEach(function beforeEach() {
    this.sinon = sinon.sandbox.create();
    this.sinon.spy(Cornea, 'send');
  });

  afterEach(function afterEach() {
    this.sinon.restore();
    requestFail = false;
  });

  after(function after() {
    Cornea.send = oldCorneaSend;
  });

  describe('message formatting', function messageFromatting() {
    it('adds type', function addsType() {
      Bridge.request('test:fn', 'test:BRIDGE');
      const message = Cornea.send.args[0][0];
      assert.equal(message.type, 'test:fn');
    });
    describe('headers', function headers() {
      it('sets isRequest to `true`', function isrequestTrue() {
        Bridge.request('test:fn', 'test:BRIDGE');
        const message = Cornea.send.args[0][0];
        assert.ok(message.headers.isRequest);
      });
      it('adds destination', function addsDestination() {
        Bridge.request('test:fn', 'test:BRIDGE');
        const message = Cornea.send.args[0][0];
        assert.equal(message.headers.destination, 'test:BRIDGE');
      });
    });
    describe('payload', function payload() {
      it('adds messageType', function addsDestination() {
        Bridge.request('test:fn', 'test:BRIDGE');
        const message = Cornea.send.args[0][0];
        assert.equal(message.payload.messageType, 'test:fn');
      });
      it('sets attributes to empty Object of none are provided', function addsEmptyAttributes() {
        Bridge.request('test:fn', 'test:BRIDGE');
        const message = Cornea.send.args[0][0];
        assert.deepEqual(message.payload.attributes, {});
      });
      it('adds attributes if defined', function addsAttributes() {
        Bridge.request('test:fn', 'test:BRIDGE', {
          name: 'Frodo',
        });
        const message = Cornea.send.args[0][0];
        assert.deepEqual(message.payload.attributes, {
          name: 'Frodo',
        });
      });
    });
  });
  describe('request', function request() {
    it('calls Cornea.send', function callsCorneaSend() {
      Bridge.request('test:fn', 'test:BRIDGE');
      assert.ok(Cornea.send.called);
    });
    it('returns Promise', function returnsPromise() {
      const promise = Bridge.request('test:fn', 'test:BRIDGE');
      assert.ok(promise.then !== undefined);
    });
    it('resolves Promise if request succeeds', function resolvesPromise(done) {
      const requestPromise = Bridge.request('test:fn', 'test:BRIDGE');
      requestPromise.then(() => {
        assert.ok(true);
        done();
      }).catch(() => {
        console.error(arguments);
        assert.ok(false);
        done();
      });
    });
    it('rejects Promise if request fails', function rejectsPromise(done) {
      requestFail = true;
      const requestPromise = Bridge.restfulRequest('test:fn', 'test:BRIDGE');
      requestPromise.catch(() => {
        assert.ok(true);
        done();
      });
    });
  });
  describe('restfulRequest', function restfulRequest() {
    it('returns Promise', function returnsPromise() {
      const requestPromise = Bridge.restfulRequest('test:fn', 'test:BRIDGE', {
        name: 'Frodo',
      });
      assert.ok(requestPromise.then !== undefined);
    });
    it('resolves Promise if request succeeds', function resolvesPromise(done) {
      const requestPromise = Bridge.restfulRequest('test:fn', 'test:BRIDGE');
      requestPromise.then(() => {
        assert.ok(true);
        done();
      }).catch(() => {
        console.error(arguments);
        assert.ok(false);
        done();
      });
    });
    it('rejects Promise if request fails', function rejectsPromise(done) {
      requestFail = true;
      const requestPromise = Bridge.restfulRequest('test:fn', 'test:BRIDGE');
      requestPromise.catch(() => {
        assert.ok(true);
        done();
      });
    });
    it('sends stringified attributes to URL', function stringifiedData(done) {
      const requestPromise = Bridge.restfulRequest('test:fn', 'test:BRIDGE', {
        name: 'Frodo',
      });
      requestPromise.then((data) => {
        assert.deepEqual(data, {
          name: 'Frodo',
        });
        done();
      }).catch(() => {
        console.error(arguments);
        assert.ok(false);
        done();
      });
    });
  });
});
