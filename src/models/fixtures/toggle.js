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
 * @page i2web/fixtures/toggle Fixture Toggle
 * @parent app.fixtures
 *
 * Adds logic when the can-fixture.on property is toggled.
 * Starts the WebSocket mock server when it is `true` and swaps out the global
 * WebSocket for the mock version.
 * Stops the running Websocket mock server and restores the global Websocket when
 * set to `false`.
 */
import fixture from 'can-fixture';
import startServer from './websocket/server';
import ArcusMockSocket from './mock-socket/websocket';

let socketFixture;

fixture.reset = function reset() {
  if (socketFixture) {
    socketFixture.reset();
  }
};

Object.defineProperty(fixture, 'on', {
  set: function set(newVal) {
    if (newVal) {
      ArcusMockSocket.mock();
      if (!socketFixture) {
        socketFixture = startServer();
      }
    } else if (socketFixture) {
      socketFixture.stop();
      socketFixture = undefined;
      ArcusMockSocket.restore();
    }
    this.enabled = newVal;
  },
  get() {
    return this.enabled;
  },
});
