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
import { ViewModel, loginErrorMessage, passkeyLoginErrorMessage } from './login';

// ViewModel unit tests
describe('i2web/pages/login', () => {
  it.skip('needs tests', () => {
    const vm = new ViewModel();
    assert.isObject(vm);
  });

  describe('loginErrorMessage', () => {
    it('reports bad credentials for 4xx responses', () => {
      assert.equal(loginErrorMessage({ status: 401 }), 'Invalid username or password');
      assert.equal(loginErrorMessage({ status: 403 }), 'Invalid username or password');
    });

    it('reports a server error for 5xx responses', () => {
      [500, 502, 503, 504].forEach((status) => {
        assert.equal(loginErrorMessage({ status }), 'A server error occurred. Please try again later.');
      });
    });

    it('reports an unreachable server when there is no response', () => {
      assert.equal(loginErrorMessage({ status: 0 }), 'Unable to reach the server. Please check your connection and try again.');
    });

    it('reports a connection error when the WebSocket fails after login', () => {
      const error = new Error('Unable to open WebSocket connection');
      error.code = 'websocket';
      assert.equal(loginErrorMessage(error), 'Unable to connect to Arcus. Please try again later.');
    });

    it('does not blame the credentials for unknown failures', () => {
      [undefined, null, new Error('boom'), {}].forEach((e) => {
        assert.equal(loginErrorMessage(e), 'Something went wrong while signing in. Please try again.');
      });
    });
  });

  describe('passkeyLoginErrorMessage', () => {
    it('says nothing when the browser prompt is dismissed', () => {
      ['NotAllowedError', 'AbortError'].forEach((name) => {
        assert.isNull(passkeyLoginErrorMessage({ name }));
      });
    });

    it('reports a passkey the platform refuses', () => {
      [400, 401].forEach((status) => {
        assert.equal(passkeyLoginErrorMessage({ status }), 'That passkey could not be used to log in. Please log in with your password.');
      });
    });

    it('reports passkeys being turned off on the platform', () => {
      assert.equal(passkeyLoginErrorMessage({ status: 404 }), 'Passkeys are not available right now. Please log in with your password.');
    });

    it('reports too many attempts', () => {
      assert.equal(passkeyLoginErrorMessage({ status: 429 }), 'Too many attempts. Please wait a few minutes and try again.');
    });

    it('reports server and connection failures as a password login does', () => {
      const websocket = new Error('Unable to open WebSocket connection');
      websocket.code = 'websocket';
      [{ status: 0 }, { status: 503 }, websocket, { name: 'SecurityError' }].forEach((e) => {
        assert.equal(passkeyLoginErrorMessage(e), loginErrorMessage(e));
      });
    });
  });
});
