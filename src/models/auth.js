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
import Cornea from 'i2web/cornea/';
import 'i2web/plugins/jquery.ajax.promise';
import config from 'i2web/config';
import events from 'events';
import _trimEnd from 'lodash/trimEnd';

/**
 * @function attachOnce
 * @param {String} event
 * @param {Function} listener
 * Makes sure the listener is not attached already through Cornea.on, unlike
 * Cornea.once, this helper can be called multiple times with the same handler
 * and it won't reattach the listener
 */
function attachOnce(event, listener) {
  const listeners = Cornea.listeners(event) || [];

  const alreadyAttached = listeners
    .filter(l => l === listener)
    .length > 0;

  if (!alreadyAttached) {
    Cornea.on(event, listener);
  }
}

/**
 * @module {Class} i2web/models/auth Auth
 * @parent app.models
 *
 * Authentication singleton. Handles all aspects of authentication for the app.
 * Extends EventEmmiter.
 */
class Auth extends events.EventEmitter {
  constructor() {
    super();
    this.active = {
      auth: false,
    };
    this.authenticated = false;
    this.on('authentication:logout', () => {
      this.authenticated = false;
      this.active = {
        auth: false,
      };
    });
    this.on('authentication:fail', () => {
      this.active = {
        auth: false,
      };
      this.authenticated = false;
    });
    this.on('authentication:success', () => {
      this.authenticated = true;
    });
    this.onSessionCreated = this.onSessionCreated.bind(this);
    this.onWebSocketClosed = this.onWebSocketClosed.bind(this);
  }
  /** @prototype */
  /**
   * @function login
   *
   * Creates a new session for the client.
   * If successful, an httpOnly cookie containing an appropriate token will be created.
   * @param {String} username
   * @param {String} password
   * @param {String} ispublic
   * @return {Promise}
   */
  login(username, password, isPublic) {
    return $.ajax({
      url: `${_trimEnd(config.apiUrl, '/')}/login`,
      method: 'post',
      data: { user: username, password, public: isPublic },
      xhrFields: {
        withCredentials: true,
      },
      headers: {
        'X-Client-Version': config.version,
      },
    }).then(() => {
      return this.startCornea();
    });
  }

  /**
   * @function emitLogout
   *
   * Emits: `authentication:logout`
   */
  emitLogout() {
    this.emit('authentication:logout');
    this.cleanupCornea();
  }

  /**
   * @function logout
   *
   * Invalidates the current session.
   * If successful, the auth token cookie will be deleted.
   *
   */
  logout(makeRequest = true) {
    if (makeRequest) {
      return $.ajax({
        url: `${_trimEnd(config.apiUrl, '/')}/logout`,
        method: 'post',
        xhrFields: {
          withCredentials: true,
        },
        headers: {
          'X-Client-Version': config.version,
        },
      }).catch(() => {
        this.emitLogout();
      });
    }
    this.emitLogout();
    return Promise.resolve();
  }

  /**
   * @function authenticate
   *
   * Attempt to connect using the current session.
   * Emits: `authentication:success` or `authentication:fail`
   * @return {Promise}
   */
  authenticate() {
    if (this.active.auth) {
      if (this.authenticated) {
        // May not want to do this, but it is an option to re-broadcast
        // Same goes for the failure message
        // this.emit('authentication:success', this.active.user);
      }
      return this.active.promise;
    }
    this.active.auth = true;

    // Handle session created and disconnect
    attachOnce('SessionCreated', this.onSessionCreated);
    attachOnce('WebSocketClosed', this.onWebSocketClosed);

    const promise = this.startCornea();
    this.active.promise = promise;
    return promise;
  }

  /**
   * @function startCornea
   *
   * Initialize a WebSocket connection using the Cornea library.
   */
  startCornea() {
    return Cornea.initialize(`${config.wsUrl}/websocket?v=${config.version}`);
  }

  /**
   * @function cleanupCornea
   *
   * Cleanup the existing Cornea WebSocket connection.
   */
  cleanupCornea() {
    Cornea.cleanup();
  }

  /**
   * @function onSessionCreated
   * @param {Object} user
   * Event listener for Cornea's SessionCreated event
   */
  onSessionCreated(user) {
    this.emit('authentication:success', user);
    this.active.user = user;
  }

  /**
   * @function onWebSocketClosed
   * @param {Object} ev
   * Event listener for WebSocketClosed event
   */
  onWebSocketClosed(ev) {
    if (this.authenticated && ev.code === 1000) {
      // closed due to logout
      this.logout();
    } else if (this.authenticated && ev.code === 4001) {
      // if a user was authenticated but their session was killed (account deleted?),
      // they will be logged out elsewhere, but we don't want to trigger an auth:fail in this case
      this.cleanupCornea();
    } else {
      // closed for any other reason
      this.emit('authentication:fail');
    }
  }
}

export default new Auth();
