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

/**
 * @module {Class} i2web/mock-socket/fixture SocketFixture
 * @parent app.mock-socket
 *
 * @signature `new SocketFixture(url, options)`
 * @param {String} url
 * @param {Object} options
 *   @option {Function} onConnection The function to invoke when the server connects
 *   @option {Function} onMessage The function to invoke when the server receives a message
 *   @option {Function} verifyClient The function to invoke before establishing a connection that verifies the user
 *
 * @description Creates a mock server to simulate Websocket communication.
 */
import MockServer from '../mock-socket/server';
import networkBridge from 'mock-socket/src/network-bridge';

export default class SocketFixture {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    // Only start a new server if there isn't one already
    if (!networkBridge.serverLookup(url)) {
      this.start();
    } else {
      console.warn(`Error: A mock server is already listening on the url ${this.url}.`);
    }
  }
  /**
   * @function start
   *
   * Creates a new mock server
   */
  start() {
    // Create a server
    this.server = new MockServer(this.url, this.options.config);
    window.MockServer = this.server;

    // Bind the connection event handler
    if (this.options.onConnection && typeof this.options.onConnection === 'function') {
      this.server.on('connection', this.options.onConnection.bind(this.server));
    }

    // Bind the message event handler
    if (this.options.onMessage && typeof this.options.onMessage === 'function') {
      this.server.on('message', this.options.onMessage.bind(this.server));
    }
  }
  emit(message, timeout) {
    const sendMessage = () => {
      this.server.send(JSON.stringify(message));
    };
    if (timeout) {
      setTimeout(sendMessage, timeout);
    } else {
      sendMessage();
    }
  }
  /**
   * @function stop
   *
   * Stops the mock server with the provided close event code
   * @param {Number} [code = 1000] The close event code
   */
  stop(code = 1000) {
    window.MockServer = null;
    this.server.close({ code });
  }
}
