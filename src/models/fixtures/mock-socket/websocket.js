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
 * @module {Object} i2web/mock-socket/socket ArcusMockSocket
 * @parent app.mock-socket
 *
 * @signature `new ArcusMockSocket(url)`
 *
 * Creates a mock Websocket instance if there is a mock server available for the
 * given url.
 *
 * @param {String} url
 *
 * @signature `ArcusMockSocket.mock()`
 *
 * Replaces the global WebSocket class with ArcusMockSocket.
 *
 * @signature `ArcusMockSocket.restore()`
 *
 * Restores the global WebSocket class
 *
 */
import MockSocket from 'mock-socket/src/websocket';
import networkBridge from 'mock-socket/src/network-bridge';

class ArcusMockSocket {
  constructor(url) {
    // Check if the url has a mock server
    if (networkBridge.serverLookup(url)) {
      return new MockSocket(url);
    }
    return new window.__originalWebSocket(url);
  }
}
// Have to expose the WebSocket constants
ArcusMockSocket.CONNECTING = 0;
ArcusMockSocket.OPEN = 1;
ArcusMockSocket.CLOSING = 2;
ArcusMockSocket.CLOSED = 3;

export default {
  mock: () => {
    if (window.WebSocket !== ArcusMockSocket) {
      window.__originalWebSocket = window.WebSocket;
      window.WebSocket = ArcusMockSocket;
    }
  },
  restore: () => {
    window.WebSocket = window.__originalWebSocket;
  },
};
