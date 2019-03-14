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

import mocha from 'mocha/mocha';
import assert from 'chai';
import Cornea from './cornea';

import SocketFixture from 'i2web/models/fixtures/mock-socket/fixture';
import ArcusMockSocket from 'i2web/models/fixtures/mock-socket/websocket';
import Router from 'i2web/models/fixtures/websocket/router';

mocha.timeout(2000);

const TEST_URL = `${window.location.protocol.replace('http', 'ws')}//localhost:1000/`;
const formatMessage = (type, destination, attrs) => {
  return {
    type,
    headers: {
      isRequest: true,
      destination,
    },
    payload: {
      messageType: type,
      attributes: attrs || {},
    },
  };
};
// Whether the fixture auth should fail
let authFail = false;
// Whether the message response should timeout
let timeoutRequest = false;
// Add a router to handle all test requests
const router = new Router();
router.add({
  init() {
    return {
      address: 'CORNEA:test:',
      testMessage() {
        return {
          messageType: 'testMessageRespone',
          attributes: {
            success: true,
          },
        };
      },
      simulateError() {
        return {
          messageType: 'Error',
          attributes: {
            success: false,
          },
        };
      },
    };
  },
});

// Fixture server to respond to requests, simulate timeouts, etc
let fixture;
function startFixture() {
  fixture = new SocketFixture(TEST_URL, {
    onConnection: function onConnect() {},
    onMessage: function onMessage(message) {
      const response = router.handleMessage(message);

      const respond = () => {
        this.send(JSON.stringify(response));
      };

      if (timeoutRequest) {
        setTimeout(respond, Cornea.timeout);
      } else {
        respond();
      }
    },
    config: {
      verifyClient: () => {
        return !authFail;
      },
    },
  });
}
function stopFixture(code) {
  fixture.stop(code);
}

describe('i2web/cornea/library', function corneaTests() {
  beforeEach(function beforeEach() {
    startFixture();
    ArcusMockSocket.mock();
  });

  afterEach(function afterEach() {
    Cornea.cleanup();
    authFail = false;
    timeoutRequest = false;
    ArcusMockSocket.restore();
    stopFixture();
  });

  after(function after() {
    ArcusMockSocket.mock();
  });

  describe('initialise', function initialisation() {
    it('throws an error if no url is provided', function throwsErrorIfNoURL() {
      try {
        Cornea.initialize();
      } catch (e) {
        assert.equal(e.message, 'URL must be defined to establish a web socket connection');
      }
    });

    it('throws an error if WebSockets are not supported', function throwsErrorIfNoSupport() {
      const oldSocket = window.WebSocket;
      window.WebSocket = undefined;
      try {
        Cornea.initialize(TEST_URL);
      } catch (e) {
        assert.equal(e.message, 'WebSockets not supported in the current browser. Please update your browser to a newer version.');
        window.WebSocket = oldSocket;
      }
    });

    it('returns a Promise', function returnsPromise() {
      const promise = Cornea.initialize(TEST_URL);
      // Having a `then` is the only thing standard across Promise implementations
      assert.ok(promise.then !== undefined);
    });

    it('Returns existing Promise if called multiple times', function returnsPromiseAgain() {
      const promise = Cornea.initialize(TEST_URL);
      promise._expando = 1234;
      const secondPromise = Cornea.initialize(TEST_URL);
      assert.equal(secondPromise._expando, 1234);
    });
  });

  describe('connecting', function connecting() {
    it('creates a WebSocket connection', function createsWebSocketConnection(done) {
      Cornea.initialize(TEST_URL);
      Cornea.connected.then(() => {
        assert.equal(Cornea.socket.readyState, window.WebSocket.CONNECTING, 'is WebSocket in connecting state');
        setTimeout(() => {
          assert.equal(Cornea.socket.readyState, window.WebSocket.OPEN);
          done();
        }, 25);
      }).catch(() => {
        console.error(arguments);
        assert.ok(false);
        done();
      });
    });

    describe.skip('connection deferred', function connectionDeferred() {
      it('is resolved when connection is successful', function resolvedIfSuccessful(done) {
        Cornea.initialize(TEST_URL);
        Cornea.connected.then(() => {
          setTimeout(() => {
            assert.ok(true);
            done();
          }, 50);
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
          done();
        });
      });

      it('is rejected when connection is unsuccessful', function rejectedIfUnsuccessful(done) {
        authFail = true;
        Cornea.initialize(TEST_URL);
        Cornea.connected.catch(() => {
          setTimeout(() => {
            assert.ok(true);
            done();
          }, 25);
        });
      });
    });

    describe('binds to WebSocket events', function bindsToWebSocketEvents() {
      beforeEach(function beforeEach(done) {
        Cornea.initialize(TEST_URL);
        Cornea.connected.then(() => {
          setTimeout(() => {
            done();
          }, 25);
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
          done();
        });
      });

      it('onopen', function onOpen() {
        assert.equal(Cornea.socket.listeners.open.length, 1);
      });

      it('onclose', function onClose() {
        assert.equal(Cornea.socket.listeners.close.length, 1);
      });

      it('onmessage', function onMessage() {
        assert.equal(Cornea.socket.listeners.message.length, 1);
      });

      it('onerror', function onerror() {
        assert.equal(Cornea.socket.listeners.error.length, 1);
      });
    });
  });

  describe('send', function sending() {
    it('returns a Promise', function returnsPromise() {
      const promise = Cornea.send(formatMessage('testMessage', 'CORNEA:test', {}));
      assert.ok(promise.then !== undefined);
    });
    it('rejects promise if socket is not open', function rejectsIfNotOpen(done) {
      Cornea.close();
      const request = Cornea.send(formatMessage('testMessage', 'CORNEA:test', {}));
      request.catch((response) => {
        assert.equal(response.message, `Wait a moment... we're getting things ready for you.`);
        done();
      });
    });
    describe('after being connected', function afterConnecting() {
      beforeEach(function beforeEach(done) {
        Cornea.initialize(TEST_URL);
        Cornea.connected.then(() => {
          setTimeout(() => {
            done();
          }, 25);
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
          done();
        });
      });
      it('rejects promise if socket is closed', function rejectsIfClosed(done) {
        Cornea.close();
        const request = Cornea.send(formatMessage('testMessage', 'CORNEA:test', {}));
        request.catch((response) => {
          assert.equal(response.message, `Wait a moment... we're getting things ready for you.`);
          done();
        });
      });
      describe('A request', function successfulResponse() {
        it('resolves promise when response is received', function resolvesIfSuccessful(done) {
          const request = Cornea.send(formatMessage('testMessage', 'CORNEA:test', {}));
          request.then((response) => {
            assert.ok(response.success);
            done();
          }).catch(() => {
            console.error(arguments);
            assert.ok(false);
            done();
          });
        });
        it('rejects promise when response is an error', function rejectsIfError(done) {
          const request = Cornea.send(formatMessage('simulateError', 'CORNEA:test', {}));
          request.catch((response) => {
            assert.ok(!response.success);
            done();
          });
        });
        it('rejects promise if response times out', function rejectsIfTimeout(done) {
          const oldTimeout = Cornea.timeout;
          Cornea.timeout = 200;
          timeoutRequest = true;
          const request = Cornea.send(formatMessage('testMessage', 'CORNEA:test', {}));
          request.catch(() => {
            assert.ok(true);
            Cornea.timeout = oldTimeout;
            done();
          });
        });
      });
    });
  });

  describe('receiving', function sending() {
    beforeEach(function beforeEach(done) {
      Cornea.initialize(TEST_URL);
      Cornea.connected.then(() => {
        done();
      }).catch(() => {
        console.error(arguments);
        assert.ok(false);
      });
    });
    describe('events with a subject', function eventsWithSubject() {
      it('emits a subject event', function emitsSubjectEvent() {
        Cornea.once('test hello', (response) => {
          assert.equal(response.message, 'hello');
          assert.equal(response['base:address'], 'CORNEA:test');
        });
        fixture.emit({
          type: 'hello',
          headers: {
            source: 'CORNEA:test',
          },
          payload: {
            attributes: {
              message: 'hello',
            },
          },
        });
      });
    });
    describe('events without a subject', function eventsWithSubject() {
      it('emits an eventType event', function emitsEventTypeEvent() {
        Cornea.once('SessionCreated', (response) => {
          assert.equal(response.message, 'SessionCreated');
        });
        fixture.emit({
          type: 'SessionCreated',
          headers: {},
          payload: {
            attributes: {
              message: 'SessionCreated',
            },
          },
        });
      });
    });
  });

  describe('closing', function closing() {
    beforeEach(function beforeEach(done) {
      Cornea.initialize(TEST_URL);
      Cornea.connected.then(() => {
        setTimeout(() => {
          done();
        }, 25);
      }).catch(() => {
        console.error(arguments);
        assert.ok(false);
      });
    });
    describe('manually', function manually() {
      it('closes the WebSocket', function closesSocket(done) {
        Cornea.socket.onclose = function onClose(ev) {
          assert.equal(ev.code, 1000);
          assert.ok(true);
          done();
        };
        Cornea.close();
      });
      it('cleans up the WebSocket', function cleansSocket(done) {
        Cornea.socket.onclose = function onClose() {
          assert.equal(Cornea.socket, null);
          done();
        };
        Cornea.close();
      });
      it('emits a WebSocketClosed event', function emitsWebSocketClosed(done) {
        Cornea.once('WebSocketClosed', () => {
          assert.ok(true);
          done();
        });
        Cornea.close();
      });
    });
    describe('from the server cleanly', function manually() {
      it('closes the WebSocket', function closesSocket(done) {
        Cornea.socket.onclose = function onClose(ev) {
          assert.equal(ev.code, 1000);
          assert.ok(true);
          done();
        };
        stopFixture(1000);
      });
      it('cleans up the WebSocket', function cleansSocket(done) {
        Cornea.socket.onclose = function onClose() {
          assert.equal(Cornea.socket, null);
          done();
        };
        stopFixture(1000);
      });
      it('emits a WebSocketClosed event', function emitsWebSocketClosed(done) {
        Cornea.once('WebSocketClosed', () => {
          assert.ok(true);
          done();
        });
        stopFixture(1000);
      });
    });
    describe('from the server', function manually() {
      it('closes the WebSocket', function closesSocket(done) {
        // Since we are using the MockSocket, onclose can be assigned to a function without
        // overriding the previous handler.
        Cornea.socket.onclose = function onClose(ev) {
          assert.equal(ev.code, 1006);
          assert.ok(true);
          done();
        };
        stopFixture(1006);
      });
    });
  });

  describe('reconnecting', function reconnecting() {
    describe('when server does not disconnect cleanly', function notClean() {
      beforeEach(function beforeEach(done) {
        Cornea.initialize(TEST_URL);
        Cornea.connected.then(() => {
          stopFixture(1006);
          done();
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
        });
      });
      // it('reconnects as soon as server comes back online', function reconnectsSoon(done) {
      //   const clock = this.clock;
      //   // Runs the first backoff callback that will attempt to connect
      //   clock.runAll();
      //   // As soon as Cornea connects again, we are done
      //   Cornea.connected.then(() => {
      //     assert.ok(true);
      //     done();
      //   });
      //   // Start the server
      //   startFixture();
      //   // Using native WebSocket, we have to keep track of the old onclose
      //   const oldOnClose = Cornea.socket.onclose;
      //   // When there is an error connecting, the socket emits an Error and Close event.
      //   // After getting that close event, the second backoff callback will be queued.
      //   Cornea.socket.onclose = function onClose() {
      //     oldOnClose.apply(Cornea.socket, arguments);
      //     // Runs the second backoff callback
      //     clock.runAll();
      //   };
      // });
    });
    describe('when server disconnects cleanly', function notClean() {
      beforeEach(function beforeEach(done) {
        Cornea.initialize(TEST_URL);
        Cornea.connected.then(() => {
          setTimeout(() => {
            stopFixture(1000);
            done();
          }, 25);
        }).catch(() => {
          console.error(arguments);
          assert.ok(false);
        });
      });
      it('cleans up Cornea instance', function noReconnect() {
        assert.equal(Cornea.socket, null);
        assert.equal(Cornea.backoff, null);
      });
    });
  });
});
