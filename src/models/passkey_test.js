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
import fixture from 'can-fixture/';
import config from 'i2web/config';
import Passkey from './passkey';

const OPERATIONS = ['LoginOptions', 'Login', 'RegisterOptions', 'Register', 'List', 'Delete'];
const url = operation => `POST ${config.apiUrl}/passkey/${operation}`;

describe('i2web/models/passkey', function passkey() {
  let sandbox;
  let originalCredential;
  let requests;

  before(function before() {
    fixture.on = true;
  });

  // Records each request body and answers with the given response
  function respond(operation, status, body) {
    fixture(url(operation), (request, response) => {
      requests[operation] = request.data;
      response(status, body);
    });
  }

  beforeEach(function beforeEach() {
    sandbox = sinon.sandbox.create();
    requests = {};
    originalCredential = window.PublicKeyCredential;
    // The JSON conversions aren't in the Chromium the tests run in
    window.PublicKeyCredential = {
      parseCreationOptionsFromJSON: options => ({ parsed: 'creation', options }),
      parseRequestOptionsFromJSON: options => ({ parsed: 'request', options }),
    };
  });

  afterEach(function afterEach() {
    sandbox.restore();
    window.PublicKeyCredential = originalCredential;
    OPERATIONS.forEach(operation => fixture(url(operation), null));
  });

  describe('isSupported', function isSupported() {
    it('is true when enabled and the browser converts options from JSON', function supported() {
      assert.isTrue(Passkey.isSupported());
    });

    it('is false when the browser lacks the JSON conversions', function noConversions() {
      window.PublicKeyCredential = function PublicKeyCredential() {};
      assert.isFalse(Passkey.isSupported());
    });

    it('is false when the browser lacks WebAuthn', function noWebAuthn() {
      delete window.PublicKeyCredential;
      assert.isFalse(Passkey.isSupported());
    });

    it('is false when the deployment has not enabled passkeys', function disabled() {
      const enabled = config.enablePasskeys;
      config.enablePasskeys = 0;
      try {
        assert.isFalse(Passkey.isSupported());
      } finally {
        config.enablePasskeys = enabled;
      }
    });
  });

  describe('login', function login() {
    it('sends the credential the browser returns for the login options', function loginFlow() {
      respond('LoginOptions', 200, { requestId: 'request-1', publicKey: { challenge: 'abc' } });
      respond('Login', 200, {});
      const get = sandbox.stub(navigator.credentials, 'get').returns(Promise.resolve({
        toJSON: () => ({ id: 'credential-1' }),
      }));

      return Passkey.login(true).then(() => {
        assert.deepEqual(get.firstCall.args[0], { publicKey: { parsed: 'request', options: { challenge: 'abc' } } });
        assert.deepEqual(requests.Login, { requestId: 'request-1', credential: { id: 'credential-1' }, public: true });
      });
    });

    it('rejects without logging in when the browser prompt is dismissed', function dismissed() {
      respond('LoginOptions', 200, { requestId: 'request-1', publicKey: { challenge: 'abc' } });
      respond('Login', 200, {});
      sandbox.stub(navigator.credentials, 'get').returns(Promise.reject({ name: 'NotAllowedError' }));

      return Passkey.login(false).then(() => {
        assert.fail('login should have been rejected');
      }, (e) => {
        assert.equal(e.name, 'NotAllowedError');
        assert.isUndefined(requests.Login);
      });
    });

    it('rejects with the response when the platform refuses the passkey', function refused() {
      respond('LoginOptions', 200, { requestId: 'request-1', publicKey: { challenge: 'abc' } });
      respond('Login', 400, { error: 'Passkey login failed' });
      sandbox.stub(navigator.credentials, 'get').returns(Promise.resolve({ toJSON: () => ({}) }));

      return Passkey.login(false).then(() => {
        assert.fail('login should have been rejected');
      }, (e) => {
        assert.equal(e.status, 400);
      });
    });
  });

  describe('register', function register() {
    it('saves the credential the browser creates under the given name', function registerFlow() {
      respond('RegisterOptions', 200, { requestId: 'request-2', publicKey: { challenge: 'def' } });
      respond('Register', 200, { id: 'credential-2', name: 'Laptop', created: 1 });
      const create = sandbox.stub(navigator.credentials, 'create').returns(Promise.resolve({
        toJSON: () => ({ id: 'credential-2' }),
      }));

      return Passkey.register('Laptop').then((saved) => {
        assert.deepEqual(create.firstCall.args[0], { publicKey: { parsed: 'creation', options: { challenge: 'def' } } });
        assert.deepEqual(requests.Register, { requestId: 'request-2', credential: { id: 'credential-2' }, name: 'Laptop' });
        assert.deepEqual(saved, { id: 'credential-2', name: 'Laptop', created: 1 });
      });
    });
  });

  describe('list', function list() {
    it('resolves with the passkeys', function listFlow() {
      const passkeys = [{ id: 'credential-1', name: 'Laptop', created: 1, lastUsed: 2 }];
      respond('List', 200, { passkeys });

      return Passkey.list().then((result) => {
        assert.deepEqual(result, passkeys);
      });
    });
  });

  describe('remove', function remove() {
    it('sends the passkey id', function removeFlow() {
      respond('Delete', 200, {});

      return Passkey.remove('credential-1').then(() => {
        assert.deepEqual(requests.Delete, { id: 'credential-1' });
      });
    });
  });
});
