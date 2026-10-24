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

import $ from 'jquery';
import 'i2web/plugins/jquery.ajax.promise';
import config from 'i2web/config';
import _trimEnd from 'lodash/trimEnd';

/**
 * @module {Object} i2web/models/passkey Passkey
 * @parent app.models
 *
 * Passkey (WebAuthn) login and management through the platform's
 * `/passkey/*` endpoints. Logging in or adding a passkey takes two requests:
 * the first returns options for the browser along with a `requestId`, and the
 * second sends the browser's credential back with that `requestId`.
 */

function request(operation, body = {}) {
  return $.ajax({
    url: `${_trimEnd(config.apiUrl, '/')}/passkey/${operation}`,
    method: 'post',
    contentType: 'application/json',
    data: JSON.stringify(body),
    dataType: 'json',
    xhrFields: {
      withCredentials: true,
    },
    headers: {
      'X-Client-Version': config.version,
    },
  });
}

export default {
  /**
   * @function isSupported
   *
   * Passkeys are offered only when the deployment enables them (`enablePasskeys`,
   * which must match `passkey.rp.id` being set on the platform) and the browser
   * can convert WebAuthn options to and from JSON.
   * @return {Boolean}
   */
  isSupported() {
    const Credential = window.PublicKeyCredential;
    return !!parseInt(config.enablePasskeys, 10)
      && !!Credential
      && typeof Credential.parseCreationOptionsFromJSON === 'function'
      && typeof Credential.parseRequestOptionsFromJSON === 'function';
  },

  /**
   * @function login
   *
   * Asks the browser for one of the person's passkeys and logs in with it.
   * If successful, the session cookie is set as it is for a password login.
   * Rejects with a DOMException if the browser prompt is dismissed, or with
   * the jqXHR if a request fails.
   * @param {Boolean} isPublic
   * @return {Promise}
   */
  login(isPublic) {
    return request('LoginOptions').then(({ requestId, publicKey }) => {
      return navigator.credentials.get({
        publicKey: window.PublicKeyCredential.parseRequestOptionsFromJSON(publicKey),
      }).then((credential) => {
        return request('Login', { requestId, credential: credential.toJSON(), public: isPublic });
      });
    });
  },

  /**
   * @function register
   *
   * Creates a passkey for the logged-in person and saves it on the platform.
   * @param {String} name Shown in the list of passkeys
   * @return {Promise<Object>} The new passkey: `{id, name, created}`
   */
  register(name) {
    return request('RegisterOptions').then(({ requestId, publicKey }) => {
      return navigator.credentials.create({
        publicKey: window.PublicKeyCredential.parseCreationOptionsFromJSON(publicKey),
      }).then((credential) => {
        return request('Register', { requestId, credential: credential.toJSON(), name });
      });
    });
  },

  /**
   * @function list
   * @return {Promise<Array>} The logged-in person's passkeys: `[{id, name, created, lastUsed}]`
   */
  list() {
    return request('List').then(({ passkeys }) => passkeys);
  },

  /**
   * @function remove
   * @param {String} id
   * @return {Promise}
   */
  remove(id) {
    return request('Delete', { id });
  },
};
